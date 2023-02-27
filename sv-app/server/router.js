const fastify = require('fastify')({ logger: true })

fastify.get('/ping', async (request, reply) => {
    return "pong"
})

module.exports = fastify
