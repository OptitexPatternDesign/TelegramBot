const global = require("./core/global.js")

global.bot.command("start", (ctx) => {
  console.log(ctx)
  console.log(ctx.from)

  const keyboard =
    new global.telegram.InlineKeyboard()
      .text('Salam')
      .text('Hi')
        .row()
      .text('new')
  global.bot.callbackQuery('Salam', ctx => {
    return ctx.reply("Salam clicked")
  })
  return ctx.reply('Here is your custom keyboard!', {
    reply_markup: keyboard,
  })
})

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
    global.app.use(global.server.json())
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    // start the server
    global.app.listen(global.config.port, () => {
    })
  }
    break;
}