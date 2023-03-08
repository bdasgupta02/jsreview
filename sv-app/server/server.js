const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const axios = require('axios')
const mongo = require('../src/database/mongo')
const smells = require('../src/engine/smells')
const bugs = require('../src/engine/bugs')
const maintainability = require('../src/engine/main')
const vulnerabilities = require('../src/engine/vuln')

// TODO squash file list to path list, then query those paths
// get around rate limit

// v2: async

const fileCache = {}
const scanning = {}
let scans

const access_token = process.env.GITHUB_TOKEN
const gh_header = {
    headers: { Authorization: access_token },
}

const getFiles = async (repoStr, user, repo, sha) => {
    scanning[repoStr] = 'Getting files..'

    const tree = await axios.get(
        `https://api.github.com/repos/${user}/${repo}/git/trees/${sha}?recursive=1`,
        gh_header,
    )
    const jsFiles = tree.data.tree.filter(file => file.path.endsWith('.js'))

    const result = []

    // not async to prevent secondary rate limit
    for (let i = 0; i < jsFiles.length; i++) {
        const file = jsFiles[i]
        const contentResp = await axios.get(
            `https://api.github.com/repos/${user}/${repo}/contents/${file.path}?ref=${sha}`,
            gh_header,
        )
        const contentData = contentResp.data
        const content = Buffer.from(contentData.content, 'base64').toString('utf-8')
        result.push({ path: file.path, content })
        scanning[repoStr] = `Downloading file ${i + 1}/${jsFiles.length}..`
    }

    // const promises = jsFiles.map(async file => {
    //     const contentResp = await axios.get(
    //         `https://api.github.com/repos/${user}/${repo}/contents/${file.path}?ref=${sha}`,
    //         gh_header,
    //     )
    //     const contentData = contentResp.data
    //     const content = Buffer.from(contentData.content, 'base64').toString('utf-8')
    //     return { path: file.path, content }
    // }) // POSSIBLE BUG (todomvc) - might be due to rate limit
    // const result = await Promise.all(promises)
    scanning[repoStr] = `All ${jsFiles.length} files downloaded..`
    fileCache[repoStr] = result
    return result
}

const startEval = async (repoStr, user, repo, sha) => {
    scanning[repoStr] = 'Starting..'

    const results = []
    const files = await getFiles(repoStr, user, repo, sha)

    for (let i = 0; i < files.length; i++) {
        const content = files[i].content

        const smellsRes = smells(content)
        const bugsRes = await bugs(content)
        const mainRes = maintainability(content)
        const vulnRes = await vulnerabilities(content)

        results.push({
            path: files[i].path,
            smells: structuredClone(smellsRes),
            bugs: structuredClone(bugsRes),
            main: structuredClone(mainRes),
            vuln: structuredClone(vulnRes),
        })
        scanning[repoStr] = `Analyzing file: ${i + 1}/${files.length}`
        console.log(`Scanning: ${repoStr}: ${i + 1}/${files.length}..`)
    }
    
    scans.insertOne({ _id: `${user}-${repo}-${sha}`, acr: results, sha: sha })
    delete scanning[repoStr]
}

fastify.register(cors, {
    origin: '*',
    methods: ['GET'],
})

fastify.get('/ping', async () => {
    return 'pong'
})

// put inside try catch
fastify.get('/acr/all/:user/:repo', async (request, reply) => {
    const { user, repo } = request.params
    const repoStr = `${user}/${repo}`
    if (repoStr in scanning) return { error: 'scanning', state: scanning[repoStr] }

    let latest
    try {
        latest = await axios.get(`https://api.github.com/repos/${user}/${repo}/commits`, gh_header)
    } catch (e) {
        return { error: 'github' }
    }
    const sha = latest?.data[0]?.sha

    const check = await scans.findOne({
        _id: { $regex: `^${user}-${repo}` },
    }) /* BYPASSING LATEST CHECK: _id: `${user}-${repo}-${sha}`*/

    if (!check) {
        startEval(repoStr, user, repo, sha)
        return { error: 'scanning', state: 'Starting..' }
    }

    if (repoStr in fileCache) {
        return { sha: sha, acr: check, files: fileCache[repoStr] }
    }

    const files = await getFiles(repoStr, user, repo, check.sha)
    return { sha: check.sha, acr: check, files }
})

// v2 modular:
// fastify.get('/acr/bugs/:user/:repo/:hash', async (request, reply) => {})
// fastify.get('/acr/smells/:user/:repo/:hash', async (request, reply) => {})
// fastify.get('/acr/main/:user/:repo/:hash', async (request, reply) => {})
// fastify.get('/acr/vuln/:user/:repo/:hash', async (request, reply) => {})

const start = async () => {
    try {
        const dbconn = await mongo.connect()
        scans = dbconn.db('acrdb').collection('scans')
        await fastify.listen({ port: 8010 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

module.exports = start
