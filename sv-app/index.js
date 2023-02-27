const router = require('./server/router')

const start = async () => {
    try {
        await router.listen({ port: 8010 })
    } catch (err) {
        router.log.error(err)
        process.exit(1)
    }
}
start()
