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
  const allFiles = await files.files()
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  for (const f of allFiles) {
    console.log(f.props.title)
    menu.text(f.props.title).row()
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
    "📄 <b>Send <u>document</u></b>\n" +
    " ● <p>Drag & drop your file</p>\n" +
    " ● <p>Forward it</p>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply(
        "📝️ <b>Send <u>file title</u></b>\n" +
        " ● <p>Make sure it's correct!</p>>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply(
        "📝️ <b>Send <u>file Description</u></b>\n" +
        " ● <p>Make sure it's correct!</p>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async description => {
      await files.add(file.message, title.message, description.message)
    })
    })
    })
}

async function cmdGetFile(ctx) {

}


// core
global.bot.command('files', cmdFiles)
global.bot.command('add_file', cmdAddFile)
global.bot.callbackQuery('add_file', cmdAddFile)
global.bot.command('get_file:.*', cmdGetFile)