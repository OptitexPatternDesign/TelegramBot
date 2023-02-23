const global = require("./core/global")

const users = require("./core/users")

global.bot.command("start", (ctx) => {
  users.userCheck(ctx.from.id.toString())
    .then(user => {
      if (user == null) {
        console.log('create')
        users.userAdd(ctx.from)
      } else {
        console.log('exist')
      }
    })
  return ctx.reply('Welcome')
})

require('./core/menus')

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
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