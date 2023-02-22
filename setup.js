const global = require("./core/global.js")

global.bot.command("start", (ctx) => {
  return ctx.reply("HI")
})

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
    global.app.use(global.server.json())
    // create webhook
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    //
    global.app.listen(global.config.port)
  } break;
}