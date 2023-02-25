const global = require("../global")

const actions = require("../actions")

const users = require("../helpers/users")
const files = require("../helpers/files")
const {telegram} = require("../global");


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "show_files", description: "Show your core"},
  {command: "show_users", description: "Show your core"},
]).then();

let menus = exports.menus = {}

menus.adminFiles = new global.ext.menu.Menu('admin-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title, (ctx) => sendFile(ctx, file))
        .row()
  })
  .text('📄 Add new file', cmdAddFile).row()
  .back('↩')

menus.userFiles = new global.ext.menu.Menu('admin-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title, (ctx) => sendFile(ctx, file))
        .row()
  })
  .back('↩')

menus.users = new global.ext.menu.Menu('users')
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      console.log(user)
  })
  .back('↩')

menus.user = new global.ext.menu.Menu('user')
  .text('📄 Files', async ctx => {})

global.bot.use(menus.adminFiles)
global.bot.use(menus. userFiles)

global.bot.use(menus.users)
global.bot.use(menus.user)

async function sendFile(ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}


let commands = exports.commands = {}

commands.showFiles = async function (ctx) {
  const user = await users.check(ctx.from)
  if (users.isAdmin(user))
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: menus.adminFiles })
  else
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: menus.userFiles })
}

commands.showUsers = async function (ctx) {
  const user = await users.check(ctx.from)
  if (users.isAdmin(user))
    return ctx.reply(
      "Users",
      { parse_mode: "HTML", reply_markup: menus.users })
  else
    ctx.answerCallbackQuery({
      text: "❌ You aren't admin!"
    })
}

commands.addFile = async function (ctx) {
  await ctx.reply(
    "📄 <b>Send <u>document</u></b>\n" +
    " ● <code>Drag & drop your file</code>\n" +
    " ● <code>Forward it</code>",
    { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply(
        "📝️ <b>Send <u>file title</u></b>\n" +
        " ● <code>Make sure it's correct!</code>",
        { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply(
        "📝️ <b>Send <u>file Description</u></b>\n" +
        " ● <code>Make sure it's correct!</code>",
        { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async description => {
      await files.add(file.message, title.message, description.message)
    })})})
}


// core
global.bot.command('show_files', commands.showFiles)
global.bot.command('show_users', commands.showUsers)
//
global.bot.command('add_file', commands.addFile)