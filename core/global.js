const m = exports

const telegram = exports.telegram = require('grammy')
const server   = exports.server   = require('express')

m.ext = {
  menu        : require("@grammyjs/menu"),
  conversation: require("@grammyjs/conversations")
}

m.config = {
    port: process.env.BOT_PORT || 3000,
    // telegram
    token: process.env.BOT_TOKEN || '',
    web  : process.env.BOT_URL   || ''
}

m.bot = new telegram.Bot(m.config.token)
m.app = new server()
//
process.env.CYCLIC_DB = 'orchid-earthworm-wigCyclicDB'
m.db = require("@cyclic.sh/dynamodb")
m.tables = {
    users : m.db.collection('users'),
    files : m.db.collection('files'),
    tokens: m.db.collection('tokens'),
}

m.admins = [
  86915035,
  379343384
]