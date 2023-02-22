const global = require("./core/global.js")

global.bot.command("start", (ctx) => {
  const keyboard =
      new global.telegram.Keyboard()
          .text('Salam').text('Hi').row()
          .text('new')
          .placeholder('Hello from IRAN')
  global.bot.callbackQuery('Salam', ctx => {
    return ctx.reply("Salam clicked")
  })
  return ctx.reply('Here is your custom keyboard!', {
    reply_markup: {
      keyboard: keyboard.build(),
      one_time_keyboard: true,
    }
  })
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