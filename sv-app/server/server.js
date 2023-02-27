const fastify = require('fastify')({ logger: true })
const cors = require('@fastify/cors')
const mongo = require('../src/database/mongo')

const scanning = new Set()
let scans

fastify.register(cors, {
    origin: ['localhost', 'http://jsreview.com', 'https://jsreview.com'],
    methods: ['GET'],
})

fastify.get('/ping', async () => {
    return 'pong'
})

fastify.get('/is-scanning/:user/:repo', async (request, reply) => {
    return true
})

fastify.get('/acr/:user/:repo', async (request, reply) => {
    const { user, repo } = request.params
    const repoStr = `${user}/${repo}`

    if (scanning.has(repoStr)) return { error: 'scanning' }

    // get latest commit hash
    // check database for commit hash,
    //  if exists: send acr, query files with github api and send js files
    //  if not: start calculation in async function, and send scanning error
    // db format: {repo: repoStr, hash, ...acr}

    // only js files in format: {path,filename,content}
    return { files: [], acr: {} }

    return { error: 'scanning' }
})

const start = async () => {
    try {
        const dbconn = await mongo.connect()
        scans = dbconn.db('acrdb').collection('scans')
        await fastify.listen({ port: 8010 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    } finally {
        mongo.close()
    }
}

module.exports = start
