const global = require("./global")

const actions = require("./actions")

const users = require("./helpers/users")
const files = require("./helpers/files")
const {raw} = require("express");


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your core"},
]).then();


async function filesAdmin(ctx) {
  const allFiles = await files.keys()
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  for (const key of allFiles) {
    console.log(key)
    console.log(files.get(key))
  }
  menu.text('Add file...', 'add_file').row()
  menu.text('Back', 'back').row()
  //
  return ctx.reply('Download core', { reply_markup: menu })
}

async function filesUser(ctx) {
  const files = files.all()
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  files.forEach(file => {
    console.log("asdf")
    console.log(file, file.props)
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
  await ctx.reply(
    "📄 *Send document*\n" +
    " ● `Drag & drop your file`\n" +
    " ● `Forward it`\n", { parse_mode: "MarkdownV2" })
  actions
    .add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply(
        "📝️ *Send file title*\n" +
        " ● `Make sure it's correct!`", { parse_mode: "MarkdownV2" })
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply(
        "📝️ *Send file Description*\n" +
        " ● `Make sure it's correct!`", { parse_mode: "MarkdownV2" })
  actions
    .add(ctx.from, 'text')
    .then(async description => {
      await files.add(file.message, title.message, description.message)
    })
    })
    })
}


// core
global.bot.command('files', cmdFiles)
// add file
global.bot.command('add_file', cmdAddFile)
global.bot.callbackQuery('add_file', cmdAddFile)