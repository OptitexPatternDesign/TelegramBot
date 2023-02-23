const global = require("./core/global.js")

global.bot.command("start", (ctx) => {
  return ctx.reply('Welcome')
})

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
    global.app.use(global.server.json())
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    // start the server
    global.app.listen(global.config.port, () => {
      console.log("Started the server!")
      global.bot.api.setWebhook('https://opd-bot.cyclic.app')
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    })
  }
    break;
}