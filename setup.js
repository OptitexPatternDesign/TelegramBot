const global = require("./core/global")

const users   = require("./core/users")
const actions = require("./core/actions")


global.bot.command("start", (ctx) => {
  users.check(ctx.from)
  return ctx.reply('Welcome')
})

require('./core/commands')

global.bot.on('message:document', (ctx) => {
  console.log("message")
  console.log(ctx.updateType)
  console.log(global.actions)
  console.log(actions.get(ctx.from))
})

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
    global.tables.users.list().then(
      res => {
        res.results.forEach(async (user,) => {
          console.log(user.key)
          await global.tables.users.delete(user.key)
        })
      }
    )
    //
    global.app.use(global.server.json())
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    // start the server
    global.app.listen(global.config.port, () => {
      console.log("Started the server!")
      // set public webhook
      global.bot.api.setWebhook('https://opd-bot.cyclic.app')
        .then(res => {
        })
        .catch(err => {
        })
    })
  }
    break;
}