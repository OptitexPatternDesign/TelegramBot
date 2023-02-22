const { Bot } = require('grammy');

const express = require('express')

const app = express()

const bot = new Bot(process.env.BOT_TOKEN); // <-- put your bot token here (https://t.me/BotFather)

bot.command('help', (ctx) => {
    ctx.reply(`
    The bot could greet people in different languages.
    The list of supported greetings:
    - hello - English
    - salut - French
    - hola - Spanish
    `)
});

bot.hears('salut', (ctx) => ctx.reply('salut'));
bot.hears('hello', (ctx) => ctx.reply('hello'));
bot.hears('hola', (ctx) => ctx.reply('hola'));

bot.on('message:text', (ctx) => ctx.reply(`Greeting "${ctx.update.message.text}" is not supported.`))

app.get('*', (req, res) => {
  console.log(req.url)
})

app.listen(3000, () => {
  console.log("asdf")
  bot.start()
})
