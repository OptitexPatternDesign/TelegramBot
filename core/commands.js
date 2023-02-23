const global = require("./global")
const users  = require('./users')


void global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your files"},
]);

global.bot.command('files', ctx => {
  const user = users.check(ctx.from)
  if (users.isAdmin(user)) {
    console.log('isAdmin')
  }
  console.log(user.fragment('files'))

  const menu = new global.telegram.InlineKeyboard()
  for (let i in ['asdf', 'a33']) {
    menu.text(`📁 ${i}`)
    menu.row()
  }
  return ctx.reply('Download files', {
    reply_markup: menu,
  })
})
