const { MongoClient } = require('mongodb')
const uri = process.env.DB_CONN
const client = new MongoClient(uri)
module.exports = client
