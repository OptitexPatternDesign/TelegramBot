const global = require("./global")

global.bot.command('files', ctx => {
  let animals = global.db.collection('files')
  console.log(animals)

  // create an item in collection with key "leo"
  let leo = animals.set('leo', {
      type:'cat',
      color:'orange'
  })

  // get an item at key "leo" from collection animals
  let item = await animals.get('leo')
  console.log(item)
  const menu = new global.telegram.InlineKeyboard()
  for (let i in ['asdf', 'a33']) {
    menu.text(`📁 ${i}`)
    menu.row()
  }
  return ctx.reply('Download files', {
    reply_markup: menu,
  })
})