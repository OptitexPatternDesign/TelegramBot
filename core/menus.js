const global = require("./global")

global.bot.command('files', ctx => {
  const files = global.tables.files
  files.list()
    .then(file => console.log(file))



  const menu = new global.telegram.InlineKeyboard()
  for (let i in ['asdf', 'a33']) {
    menu.text(`📁 ${i}`)
    menu.row()
  }
  return ctx.reply('Download files', {
    reply_markup: menu,
  })
})
