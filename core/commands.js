const global = require("./global")

const users   = require("./users")
const actions = require("./actions")


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
    // files.forEach(file => {
    //   menu.text(file.props.name).row()
    // })
    menu.text('Add file...', 'add_file').row()
    menu.text('Back', 'back').row()
    //
    global.bot.callbackQuery('add_file', async (ctx) => {
      await ctx.reply('File')
      await actions.add(ctx.from, 'document')
        .then(ctx => {
          console.log("File", ctx.message.document)
        })
      await ctx.reply('File name')
      await actions.add(ctx.from, 'text')
        .then(ctx => {
          console.log("Text", ctx)
        })
    })
    //
    return ctx.reply('Download files', {
      reply_markup: menu,
    })
  } else {
    console.log('user')
  }
})
