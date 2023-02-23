const global = require("./global")
const users  = require('./users')


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your files"},
]).then();

global.bot.command('files', async ctx => {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user)) {
    console.log('admin')
    const files = (await global.tables.files.list()).results
    //
    const menu = new global.telegram.InlineKeyboard()
    files.forEach(file => {
      menu.text(file.props.name).row()
    })
    menu.text('Add file...', 'add_file').row()
    menu.text('Back', 'back').row()
    //
    global.bot.callbackQuery('add_file', (ctx) => {
      ctx.reply('add File')
    })
    //
    return ctx.reply('Download files', {
      reply_markup: menu,
    })
  } else {
    console.log('user')
  }
})
