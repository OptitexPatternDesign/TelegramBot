const global = require("./global")

global.bot.command('files', ctx => {
  let files = global.db.collection('files')
  console.log(files.list())



  const menu = new global.telegram.InlineKeyboard()
  for (let i in ['asdf', 'a33']) {
    menu.text(`📁 ${i}`)
    menu.row()
  }
  return ctx.reply('Download files', {
    reply_markup: menu,
  })
})