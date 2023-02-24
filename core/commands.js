const global = require("./global")

const actions = require("./actions")

const users = require("./helpers/users")
const files = require("./helpers/files")


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your core"},
]).then();


async function filesAdmin(ctx) {
  const files = (await global.tables.files.list()).results
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  files.forEach(file => {
    console.log(file)
  })
  menu.text('Add file...', 'add_file').row()
  menu.text('Back', 'back').row()
  //
  return ctx.reply('Download core', { reply_markup: menu })
}

async function filesUser(ctx) {
  const files = (await global.tables.files.list()).results
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  files.forEach(file => {
    console.log(file)
  })
  menu.text('Back', 'back').row()
  //
  return ctx.reply('Download core', { reply_markup: menu })
}


async function cmdFiles(ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await filesAdmin(ctx)
  else
    await filesUser(ctx)
}

async function cmdAddFile(ctx) {
  await ctx.reply('File')
  actions
    .add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply('**Title**')
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply('**Description**')
  actions
    .add(ctx.from, 'text')
    .then(async description => {
      console.log(file, title, description)
    })
    })
    })
}


// core
global.bot.command('files', cmdFiles)
// add file
global.bot.command('add_file', cmdAddFile)
global.bot.callbackQuery('add_file', cmdAddFile)