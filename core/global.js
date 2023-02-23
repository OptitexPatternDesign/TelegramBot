const telegram = exports.telegram = require('grammy')
const server   = exports.server   = require('express')


config = exports.config = {
    port: process.env.BOT_PORT || 3000,
    // telegram
    token: process.env.BOT_TOKEN || '',
    web  : process.env.BOT_URL   || ''
}

bot = exports.bot = new telegram.Bot(config.token);
app = exports.app = new server()
process.env.CYCLIC_DB = 'orchid-earthworm-wigCyclicDB'
db  = exports.db  = require("@cyclic.sh/dynamodb")
//
tables = exports.tables = {
    users : db.collection('users'),
    admins: db.collection('admins'),
    files : db.collection('files')
}