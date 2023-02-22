const telegram = exports.telegram = require('grammy')
const server   = exports.server   = require('express')

const CyclicDb = require("@cyclic.sh/dynamodb")


config = exports.config = {
    port: process.env.BOT_PORT || 3000,
    // telegram
    token: process.env.BOT_TOKEN || ''
}

bot = exports.bot = new telegram.Bot(config.token);
app = exports.app = new server()
db  = exports.db  = CyclicDb(process.env.CYCLIC_DB)