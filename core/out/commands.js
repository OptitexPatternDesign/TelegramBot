const m = exports
//
const global = require("../global")

const actions = require("../actions")

const users  = require("../helpers/users")
const files  = require("../helpers/files")
const tokens = require("../helpers/tokens")


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "show_files", description: "Show your core"},
  {command: "show_users", description: "Show your core"},
  {command: "show_tokens", description: "Show your core"},
  {command: "add_file", description: "Add new file to server"},
  {command: "add_token", description: "Add new file to server"},
]).then();


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
m.menus.adminFiles
  = new global.ext.menu.Menu('admin-files',
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
m.menus.userFiles =
  new global.ext.menu.Menu('user-files',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .dynamic(async (ctx, range) => {
    const user = await users.check(ctx.from)
    //
    for (const file of await files.user(user))
      range
        .text(file.props.title,
          (ctx) => m.commands.sendFile(ctx, file))
        .row()
  })
m.menus.userFiles.text = () =>
  "📄 <b>Your accessible <u>files</u></b>\n" +
  " ● <code>Click on your file, َAnd pay attention to description!</code>\n"

// ++++++++++
m.menus.users =
  new global.ext.menu.Menu('users',
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
m.menus.editUser =
  new global.ext.menu.Menu('edit-user',
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
m.menus.editUserFiles =
  new global.ext.menu.Menu('edit-user-files',
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
m.menus.editFile =
  new global.ext.menu.Menu('edit-file',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .text('📄 Document',
    async (ctx) => {
      await ctx.reply(
        "📄 <b>Update <u>file document</u></b>\n",
        { parse_mode: "HTML" })
      actions
        .add(ctx.from, 'document')
        .then(async title =>
          await files.update(ctx.session.activeFile, document.message, null, null))
    })
  .text('📝️ Title',
    async (ctx) => {
      await ctx.reply(
        "📄 <b>Update <u>file title</u></b>\n",
        { parse_mode: "HTML" })
      actions
        .add(ctx.from, 'text')
        .then(async title =>
          await files.update(ctx.session.activeFile, null, title.message, null))
    })
  .text('📝️ Description',
    async (ctx) => {
      await ctx.reply(
        "📄 <b>Update <u>file description</u></b>\n",
        { parse_mode: "HTML" })
      actions
        .add(ctx.from, 'text')
        .then(async description =>
          await files.update(ctx.session.activeFile, null, null, description.message))
    })
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await files.delete(ctx.session.activeFile)
      //
      m.menus.replace(ctx, m.menus.adminFiles)
    })
  .row()
  .text('↩',
    (ctx) => m
      .menus.replace(ctx, m.menus.adminFiles))
m.menus
  .adminFiles.register(m.menus.editFile)
//
m.menus.editFile.text = (ctx) =>
  'reatea'

//
m.menus.tokens =
  new global.ext.menu.Menu('tokens',
  {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  })
  .dynamic(async (ctx, range) => {
    for (const token of await tokens.all()) {
      range
        .text(`${token.props.name}`)
        .row()
    }
  })
  .text('Generate',
    (ctx) => m.commands
      .addToken(ctx))
//
m.menus.tokens.text = (ctx) =>
  'Tokens'

global.bot.use(m.menus.adminFiles)
global.bot.use(m.menus. userFiles)

global.bot.use(m.menus.users)

global.bot.use(m.menus.tokens)


m.commands = {}

m.commands.start = async function (ctx) {
  await users.check(ctx.from)
  //
  return ctx.reply('Welcome')
}

m.commands.register = async function (ctx) {
  const user = users.check(ctx.from)
  console.log(user.props)
  //
  if (user.props.registered) {
    await ctx.reply('Already registered')
  } else {
    await ctx.reply(
      'Enter token key'
    )
    actions
      .add(ctx.from, 'document')
      .then(async key => {
        const result = await tokens.register(key.message, user)
        //
        switch (result) {
          case tokens.errorTokenInvalidKey: {
            await ctx.reply('Invalid token!')
          } break
          case tokens.errorTokenUsersLimit: {
            await ctx.reply('Reached users limit!')
          } break
          default: {
            await ctx.reply('Successfully registered')
          }
        }
      })
  }
}

m.commands.showFiles = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return m.menus.show(ctx, m.menus.adminFiles)
  else
    return m.menus.show(ctx, m.menus.userFiles)
}

m.commands.showUsers = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return m.menus.show(ctx, m.menus.users)
}

m.commands.showTokens = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return m.menus.show(ctx, m.menus.tokens)
}

m.commands.sendFile = async function (ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}

m.commands.addFile = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user)) {
    await ctx.reply(
      "📄 <b>Send <u>document</u></b>\n" +
      " ● <code>Drag & drop your file</code>\n" +
      " ● <code>Forward it</code>",
      { parse_mode: "HTML" })
    actions
      .add(ctx.from, 'document')
      .then(async document => {
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
        await files.add(document.message, title.message, description.message)
      })})})
  }
}

m.commands.addToken = async function (ctx) {
  await ctx.reply(
    "📄 <b>Set <u>token name</u></b>\n",
    { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async name => {
      await ctx.reply(
        "📝️ <b>Set <u>users limit</u></b>\n",
        { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async limitUsers => {
      const result = await tokens.add(name.message, limitUsers.message)
      //
      await ctx.reply(result.key)
    })})
}

// core
global.bot.command('show_files' , m.commands.showFiles)
global.bot.command('show_users' , m.commands.showUsers)
global.bot.command('show_tokens', m.commands.showTokens)
//
global.bot.command('add_file' , m.commands.addFile)
global.bot.command('add_token', m.commands.addToken)
//
global.bot.command('register', m.commands.register)