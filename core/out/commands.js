const m = exports
//
const global = require("../global")

const actions = require("../actions")

const users = require("../helpers/users")
const files = require("../helpers/files")


// global.bot.api.setMym.commands([
//   {command: "start", description: "Begin the robot"},
//   {command: "show_files", description: "Show your core"},
//   {command: "show_users", description: "Show your core"},
// ]).then();


m.menus = {}

m.menus.adminFiles = new global.ext.menu.Menu('admin-files')
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title,
          (ctx) => sendFile(ctx, file))
        .row()
  })
  .text('📄 Add new file', (ctx) => m.commands.addFile(ctx)).row()
  .back('↩')

m.menus.userFiles = new global.ext.menu.Menu('user-files')
  .dynamic(async (ctx, range) => {
    const user = await users.check(ctx.from)
    //
    for (const file of await files.user(user))
      range
        .text(file.props.title,
          (ctx) => sendFile(ctx, file))
        .row()
  })
  .back('↩')

m.menus.users = new global.ext.menu.Menu('users')
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user))
        range
          .text(users.name(user),
            (ctx) => {
              ctx.session.activeUser = user
              //
              ctx.menu.nav('edit-user')
            })
          .row()
  })

m.menus.editUser = new global.ext.menu.Menu('edit-user')
  .submenu('📄 Files', 'edit-user-files').row()
  .back('↩')

m.menus.editUserFiles = new global.ext.menu.Menu('edit-user-files')
  .dynamic(async (ctx, range) => {
    const user = ctx.session.activeUser
    //
    for (const file of await files.all())
      range
        .text(`${file.props.title} ${await files.userContain(user, file) ? '✅' : '❌'}`,
          async (ctx) => {
            await files.userToggle(user, file)
            //
            ctx.menu.update()
          })
        .row()
  })
  .back('↩')

m.menus.users.register(m.menus.editUser)
m.menus.editUser.register(m.menus.editUserFiles)

global.bot.use(m.menus.adminFiles)
global.bot.use(m.menus. userFiles)

global.bot.use(m.menus.users)


async function sendFile(ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}

m.commands = {}

m.commands.showFiles = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: m.menus.adminFiles })
  else
    return ctx.reply(
      "Download core",
      { parse_mode: "HTML", reply_markup: m.menus.userFiles })
}

m.commands.showUsers = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return ctx.reply(
      "Users",
      { parse_mode: "HTML", reply_markup: m.menus.users })
  else
    return ctx.reply('error')
}

m.commands.addFile = async function (ctx) {
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
global.bot.command('show_files', m.commands.showFiles)
global.bot.command('show_users', m.commands.showUsers)
//
global.bot.command('add_file', m.commands.addFile)