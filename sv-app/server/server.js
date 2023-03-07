const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const axios = require('axios')
const mongo = require('../src/database/mongo')
const smells = require('../src/engine/smells')
const bugs = require('../src/engine/bugs')
const maintainability = require('../src/engine/main')
const vulnerabilities = require('../src/engine/vuln')

const scanning = new Set()
let scans

const access_token = process.env.GITHUB_TOKEN
const gh_header = {
    headers: { Authorization: access_token },
}

const getFiles = async (user, repo, sha) => {
    const tree = await axios.get(
        `https://api.github.com/repos/${user}/${repo}/git/trees/${sha}?recursive=1`,
        gh_header,
    )
    const jsFiles = tree.data.tree.filter(file => file.path.endsWith('.js'))
    const promises = jsFiles.map(async file => {
        const contentResp = await axios.get(
            `https://api.github.com/repos/${user}/${repo}/contents/${file.path}?ref=${sha}`,
            gh_header,
        )
        const contentData = contentResp.data
        const content = Buffer.from(contentData.content, 'base64').toString('utf-8')
        return { path: file.path, content }
    })
    const result = await Promise.all(promises)
    return result
}

const startEval = async (repoStr, user, repo, sha) => {
    scanning.add(repoStr)

    // use inference api directly

    const toSave = []
    const results = []
    const files = await getFiles(user, repo, sha)

    for (let i = 0; i < files.length; i++) {
        const content = files[i].content

        const smellsRes = smells(content)
        const bugsRes = await bugs(content)
        const mainRes = maintainability(content)
        const vulnRes = vulnerabilities(content)

        results.push({...files[i], smells: smellsRes, bugs: bugsRes, main: mainRes})
    }

    console.dir(results, {depth: null})
    
    //scans.insertOne({_id: `${user}-${repo}-${sha}`, ...results})
    scanning.delete(repoStr)
}

fastify.register(cors, {
    origin: ['localhost', 'http://jsreview.com', 'https://jsreview.com'],
    methods: ['GET'],
})

fastify.get('/ping', async () => {
    return 'pong'
})

// put inside try catch
fastify.get('/acr/all/:user/:repo', async (request, reply) => {
    const { user, repo } = request.params
    const repoStr = `${user}/${repo}`
    if (scanning.has(repoStr)) return { error: 'scanning' }

    const latest = await axios.get(`https://api.github.com/repos/${user}/${repo}/commits`, gh_header)
    const sha = latest?.data[0]?.sha

    const check = await scans.findOne({ _id: `${user}-${repo}-${sha}` })
    if (!check) {
        startEval(repoStr, user, repo, sha)
        return { error: 'scanning' }
    }

    const files = await getFiles(user, repo, sha)
    return { files: files, acr: check, sha: sha }
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
