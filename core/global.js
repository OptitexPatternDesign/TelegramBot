const telegram = exports.telegram = require('grammy')
const server   = exports.server   = require('express')

const config = exports.config = {
    port: process.env.BOT_PORT || 3000,
    // telegram
    token: process.env.BOT_TOKEN || '',
    web  : process.env.BOT_URL   || ''
}

const bot = exports.bot = new telegram.Bot(config.token)
const app = exports.app = new server()
process.env.CYCLIC_DB = 'orchid-earthworm-wigCyclicDB'
const db  = exports.db  = require("@cyclic.sh/dynamodb")
//
const tables = exports.tables = {
    users : db.collection('users'),
    files : db.collection('files'),
    tokens: db.collection('tokens'),
}