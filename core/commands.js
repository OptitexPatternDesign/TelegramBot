const global = require("./global")

const users   = require("./users")
const actions = require("./actions")
const {bot} = require("./global");


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your files"},
]).then();


async function files(ctx) {
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
    return ctx.reply('Download files', {
      reply_markup: menu,
    })
  } else {
    console.log('user')
  }
}
global.bot.command('files', files)

async function add_file(ctx) {
  await ctx.reply('File')
  actions.add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply('File name')
      actions.add(ctx.from, 'text')
        .then(async filename => {
          console.log(file.message, filename.message)
        })
    })
}

global.bot.command('add_file', add_file)
global.bot.callbackQuery('add_file', add_file)