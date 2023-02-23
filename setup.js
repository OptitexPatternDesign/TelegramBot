const global = require("./core/global")
const users  = require("./core/users")


global.bot.command("start", (ctx) => {
  users.check(ctx.from)
  return ctx.reply('Welcome')
})

global.bot.on('*', (ctx) => {
  console.log(ctx)
})

require('./core/commands')

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