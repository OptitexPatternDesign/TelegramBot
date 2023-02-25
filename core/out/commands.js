const global = require("../global")

const actions = require("../actions")

const users = require("../helpers/users")
const files = require("../helpers/files")
const {session} = require("grammy");


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "show_files", description: "Show your core"},
  {command: "show_users", description: "Show your core"},
]).then();


async function sendFile(ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}

async function editUser(ctx, user) {
  console.log(ctx)
  ctx.activeUser = user
  console.log(ctx)
  await ctx.reply(
    "",
    { parse_mode: "HTML", reply_markup: user })
}


let commands = exports.commands = {}

commands.showFiles = async function (ctx) {
  const user = await users.check(ctx.from)
  if (users.isAdmin(user))
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: adminFiles })
  else
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: userFiles })
}

commands.showUsers = async function (ctx) {
  console.log("asdf", deditUser)
  return ctx.reply(
    "Users",
    { parse_mode: "HTML", reply_markup: deditUser })
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

let menus = exports.menus = {}

const adminFiles = new global.ext.menu.Menu('admin-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title,
          (ctx) => sendFile(ctx, file))
        .row()
  })
  .text('📄 Add new file', commands.addFile).row()
  .back('↩')

const userFiles = new global.ext.menu.Menu('user-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title,
          (ctx) => sendFile(ctx, file))
        .row()
  })
  .back('↩')

const getUsers = new global.ext.menu.Menu('users')
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user))
        range
          .text(users.name(user),
            async (ctx) => {
            console.log(user, "clicked")
              ctx.session.activeUser = user
              //
              console.log(editUser)
              console.log(menus)
              await ctx.reply(
                "Edit user",
                {parse_mode: "HTML", reply_markup: editUserFiles})
            })
          .row()
  })
  .back('↩')

const deditUser = new global.ext.menu.Menu('edit-user')
  // .text('📄 Files', async (ctx) => {
  //   console.log(ctx)
  // })
  .back('↩')

const editUserFiles = new global.ext.menu.Menu('edit-user-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title,
          (ctx) => sendFile(ctx, file))
        .row()
  })
  .back('↩')

global.bot.use(adminFiles)
// global.bot.use( userFiles)

console.log(global.bot.use(getUsers))

global.bot.use(deditUser)
global.bot.use(editUserFiles)


// core
global.bot.command('show_files', commands.showFiles)
global.bot.command('show_users', commands.showUsers)
//
global.bot.command('add_file', commands.addFile)