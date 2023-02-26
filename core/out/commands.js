const m = exports
//
const global = require("../global")

const actions = require("../actions")

const users = require("../helpers/users")
const files = require("../helpers/files")
const {menus} = require("./commands");


// global.bot.api.setMym.commands([
//   {command: "start", description: "Begin the robot"},
//   {command: "show_files", description: "Show your core"},
//   {command: "show_users", description: "Show your core"},
// ]).then();


m.menus = {
  replace: function (ctx, menu, text=null) {
    ctx.menu.nav(menu.id)
    // change menu text
    ctx.editMessageText(text || menu.text(ctx),
      { parse_mode: "HTML" })
  },

  show: function (ctx, menu, text=null) {
    return ctx.reply(text || menu.text(ctx),
      { parse_mode: "HTML", reply_markup: menu })
  }
}

// +++++++++++++++
m.menus.adminFiles = new global.ext.menu.Menu('admin-files',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
        .text(file.props.title, (ctx) => {
          ctx.session.activeFile = file
          //
          console.log("click")
          m.menus.replace(ctx, m.menus.editFile)
        })
        .row()
  })
  .text('📄 Add new file',
    (ctx) => m.commands
      .addFile(ctx))
//
m.menus.adminFiles.text = () =>
  "📄 <b>Server <u>files</u></b>\n" +
  " ● <code>Edit file</code> 📄\n" +
  " ● <code>Add new file</code> 📄\n"

// ++++++++++++++
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
m.menus.userFiles.text = () =>
  "📄 <b>Your accessible <u>files</u></b>\n" +
  " ● <code>Click on your file, َAnd pay attention to description!</code>\n"

// ++++++++++
m.menus.users = new global.ext.menu.Menu('users',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user))
        range
          .text(users.name(user), (ctx) => {
            ctx.session.activeUser = user
            // move to new menu
            m.menus.replace(ctx, m.menus.editUser)
          })
          .row()
  })
//
m.menus.users.text = () =>
  "👤 <b>All <u>users</u></b>\n" +
  " ● <code>Change access to files</code> 📄"

// +++++++++++++
m.menus.editUser = new global.ext.menu.Menu('edit-user',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .text('📄 Files',
    (ctx) => m
      .menus.replace(ctx, m.menus.editUserFiles))
  .row()
  .text('↩',
    (ctx) => m
      .menus.replace(ctx, m.menus.users))
m.menus
  .users.register(m.menus.editUser)
//
m.menus.editUser.text = (ctx) =>
  `<b>You are editing '${users.name(ctx.session.activeUser)}'</b>\n` +
  ` ⚠️ <code>Any change will apply!</code>`

// ++++++++++++++++++
m.menus.editUserFiles = new global.ext.menu.Menu('edit-user-files',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .dynamic(async (ctx, range) => {
    const user = ctx.session.activeUser
    //
    for (const file of await files.all())
      range
        .text(`${file.props.title} ${await files.userContain(user, file) ? '✅' : '❌'}`,
          async (ctx) => {
            await files.userToggle(user, file)
            // update menu buttons
            ctx.menu.update()
          })
        .row()
  })
  .text('↩',
    (ctx) => m
      .menus.replace(ctx, m.menus.editUser))
m.menus
  .editUser.register(m.menus.editUserFiles)
//
m.menus.editUserFiles.text = (ctx) =>
  `<b>Change '${users.name(ctx.session.activeUser)}' access to files</b>`

// +++++++++++++
m.menus.editFile = new global.ext.menu.Menu('edit-user-files')
  .text('📄 Document').text('📝️ Title').text('📝️ Description')
  .row()
  .text('❌ Delete')
  .row()
  .text('↩',
    (ctx) => m
      .menus.replace(ctx, m.menus.adminFiles))
m.menus
  .adminFiles.register(m.menus.editFile)
//
m.menus.editFile.text = (ctx) =>
  'reatea'

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
    return m
      .menus.show(ctx,
        m.menus.adminFiles,
        m.menus.adminFiles.text(ctx))
  else
    return m
      .menus.show(ctx,
        m.menus.userFiles,
        m.menus.userFiles.text(ctx))
}

m.commands.showUsers = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return m
      .menus.show(ctx,
        m.menus.users,
        m.menus.users.text(ctx))
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
        "📝️ <b>Send <u>title</u></b>\n" +
        " ● <code>Make sure it's correct!</code>",
        { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply(
        "📝️ <b>Send <u>description</u></b>\n" +
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