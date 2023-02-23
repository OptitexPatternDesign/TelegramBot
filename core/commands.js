const global = require("./global")
const users  = require('./users')


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your files"},
]).then();

global.bot.command('files', async ctx => {
  const user = await users.check(ctx.from)
  console.log(user)
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
