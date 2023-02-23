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
    const files = (await global.tables.files.list()).results
    //
    const menu = new global.telegram.InlineKeyboard()
    menu.text('Add file...', 'add_file').row()
    menu.text('Back', 'back').row()
    //
    return ctx.reply('Server files', {
      reply_markup: menu,
    })
  } else {
  }
})
global.bot.callbackQuery('add_file', async (ctx) => {
  let message;
  //
  message = await ctx.reply('add File')
  actions.add(ctx.from, 'document', async (ctx) => {
      console.log(ctx)
      console.log(ctx.message)
      await ctx.deleteMessage(message.message_id)
      //
      message = await ctx.reply('Enter file name:')
      actions.add(ctx.from, 'text', (ctx) => {
        console.log('finish', ctx.message)
      })
    })
})