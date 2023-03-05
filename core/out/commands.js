const m = exports
//
const global = require("../global")
//
const actions = require("../actions")
//
const users  = require("../helpers/users")
const files  = require("../helpers/files")
const tokens = require("../helpers/tokens")


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "help" , description: "Show commands help"},
  {command: "register", description: "Register to server"},
  {command: "show_files", description: "Show your downloadable files"},
  // admin related
  // {command: "show_users", description: "Show your core"},
  // {command: "show_tokens", description: "Show your core"},
  // {command: "add_file", description: "Add new file to server"},
  // {command: "add_token", description: "Add new file to server"},
]).then();


async function updateSession(ctx, key=null) {
  switch (key) {
    case 'token': if (ctx.session.activeToken)
      return ctx.session.activeToken = await tokens.get(ctx.session.activeToken.key)
      break
    case 'user': if (ctx.session.activeUser)
      return ctx.session.activeUser = await users.get(ctx.session.activeUser.key)
      break
  }
}

async function checkUser(ctx) {
}


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
  },

  params: {
    onMenuOutdated: async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.deleteMessage()
    }
  }
}

// +++++++++++++++
m.menus.adminFiles
  = new global.ext.menu.Menu('admin-files', m.menus.params)
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
      .text(file.props.title,
        (ctx) => {
          ctx.session.activeFile = file
          //
          m.menus.replace(ctx, m.menus.editFile)
        })
      .row()
  })
  .text('📄 Add new file',
    (ctx) =>
      m.commands.addFile(ctx))
m.menus.adminFiles
  .text = () =>
  "📄 <b>Server <u>files</u></b>\n" +
  " ● <code>Edit file</code> 📄\n" +
  " ● <code>Add new file</code> 📄\n"

// ++++++++++++++
m.menus.userFiles =
  new global.ext.menu.Menu('user-files', m.menus.params)
  .dynamic(async (ctx, range) => {
    const user  = await users.check(ctx.from)
    const token = await tokens.get(user.props.registered)
    //
    for (const file of await files.token(token))
      range
      .text(file.props.title,
        (ctx) =>
          m.commands.sendFile(ctx, file))
      .row()
  })
m.menus.userFiles
  .text = () =>
  "📄 <b>Your accessible <u>files</u></b>\n" +
  "<code>Click on your file to download it, َAnd pay attention to description!</code>\n"

// +++++++++++++
m.menus.editFile =
  new global.ext.menu.Menu('edit-file', m.menus.params)
  .text('📄 Document',
    async (ctx) => {
      await ctx.reply(
        "📄 <b>Update <u>file document</u></b>\n",
        { parse_mode: "HTML" })
      actions
        .add(ctx.from, 'document')
        .then(async document =>
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
    (ctx) =>
      m.menus.replace(ctx, m.menus.adminFiles))
m.menus.editFile
  .text = (ctx) =>
  ` ⚠ <b>You are editing '${ctx.session.activeFile.props.title}'</b>`

// ++++++++++
m.menus.users =
  new global.ext.menu.Menu('users', m.menus.params)
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user) && user.props.registered)
        range
        .text(users.name(user),
          async (ctx) => {
            ctx.session.activeUser  = user
            ctx.session.activeToken = await tokens.get(user.props.registered)
            // move to new menu
            m.menus.replace(ctx, m.menus.editUser)
          })
        .row()
  })
m.menus.users
  .text = () =>
  "👤 <b>All <u>users</u></b>\n" +
  " ● <code>Change access to files</code> 📄"

// +++++++++++++
m.menus.editUser =
  new global.ext.menu.Menu('edit-user', m.menus.params)
  .text('📄 Files',
    (ctx) =>
      m.menus.replace(ctx, m.menus.editUserFiles))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.unregister(ctx.session.activeUser)
      //
      m.menus.replace(ctx, m.menus.users)
    })
  .row()
  .text('↩',
    (ctx) =>
      m.menus.replace(ctx, m.menus.users))
m.menus.editUser
  .text = (ctx) =>
  `<b>You are editing '${users.name(ctx.session.activeUser)}'</b>\n` +
  ` ⚠️ <code>Any change will apply!</code>`

// ++++++++++++++++++
m.menus.editUserFiles =
  new global.ext.menu.Menu('edit-user-files', m.menus.params)
  .dynamic(async (ctx, range) => {
    const token = ctx.session.activeToken
    //
    for (const file of await files.all())
      range
      .text(`${file.props.title} ${await files.tokenContains(token, file) ? '✅' : '❌'}`,
        async (ctx) => {
          await files.tokenToggle(token, file)
          // update menu buttons
          ctx.menu.update()
        })
      .row()
  })
  .text('↩',
    (ctx) =>
      m.menus.replace(ctx, m.menus.editUser))
m.menus.editUserFiles
  .text = (ctx) =>
  `<b>Change '${users.name(ctx.session.activeUser)}' files access</b>`

// +++++++++++
m.menus.tokens =
  new global.ext.menu.Menu('tokens', m.menus.params)
  .dynamic(async (ctx, range) => {
    for (const token of await tokens.all()) {
      range
      .text(`${token.props.name}`,
        (ctx) => {
          ctx.session.activeToken = token
          // move to new menu
          m.menus.replace(ctx, m.menus.editToken)
        })
      .row()
    }
  })
  .text('🔑 Generate new token',
    (ctx) =>
      m.commands.addToken(ctx))
m.menus.tokens
  .text = () =>
  '<b>Tokens</b>'

// ++++++++++++++
m.menus.editToken =
  new global.ext.menu.Menu('edit-token', m.menus.params)
  .text('📄 Files',
    async (ctx) =>
      m.menus.replace(ctx, m.menus.editTokenFiles))
  .text('👤 Users',
    async (ctx) =>
      m.menus.replace(ctx, m.menus.editTokenUsers))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.delete(ctx.session.activeToken)
      //
      m.menus.replace(ctx, m.menus.tokens)
    })
  .row()
  .text('↩',
    (ctx) =>
      m.menus.replace(ctx, m.menus.tokens))
m.menus.editToken
  .text = (ctx) =>
  ` ⚠ <b>You are editing '${ctx.session.activeToken.props.name}'</b>\n` +
  ` ● <b>Key: </b><code>${ctx.session.activeToken.key}</code>\n` +
  ` ● <b>Users: </b><code>${ctx.session.activeToken.props.users.length} / ${ctx.session.activeToken.props.limitUsers}</code>\n`

// +++++++++++++++++++
m.menus.editTokenFiles =
  new global.ext.menu.Menu('edit-token-files', m.menus.params)
  .dynamic(async (ctx, range) => {
    const token = await updateSession(ctx, 'token')
    //
    for (const file of await files.all())
      range
      .text(`${file.props.title} ${await files.tokenContains(token, file) ? '✅' : '❌'}`,
        async (ctx) => {
          await files.tokenToggle(token, file)
          // update menu buttons
          ctx.menu.update()
        })
      .row()
  })
  .text('↩',
    (ctx) =>
      m.menus.replace(ctx, m.menus.editToken))
m.menus.editTokenFiles
  .text = (ctx) =>
  `<b>Change '${ctx.session.activeToken.props.name}' files access</b>`

// +++++++++++++++++++
m.menus.editTokenUsers =
  new global.ext.menu.Menu('edit-token-users', m.menus.params)
  .dynamic(async (ctx, range) => {
    const token = await updateSession(ctx, 'token')
    //
    for (const user of await tokens.users(token)) {
      range
      .text(users.name(user),
        async (ctx) => {
          await tokens.unregister(user)
          //
          ctx.menu.update()
        })
      .row()
    }
  })
  .text('↩',
    (ctx) =>
      m.menus.replace(ctx, m.menus.editToken))
m.menus.editTokenUsers
  .text = (ctx) =>
  `<b>Change '${ctx.session.activeToken.props.name}' users</b>`


// set menus
global.bot.use(m.menus.tokens)
m.menus.tokens   .register(m.menus.editToken)
m.menus.editToken.register(m.menus.editTokenUsers)
m.menus.editToken.register(m.menus.editTokenFiles)
//
global.bot.use(m.menus.adminFiles)
m.menus.adminFiles.register(m.menus.editFile)
//
global.bot.use(m.menus.userFiles)
//
global.bot.use(m.menus.users)
m.menus.users   .register(m.menus.editUser)
m.menus.editUser.register(m.menus.editUserFiles)


m.commands = {}

m.commands.start = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  return ctx.reply(
    `<b>Welcome <u>${users.name(user)}</u></b>\n` +
    ` ● <code>ID: ${user.key}</code>`,
    { parse_mode: "HTML" })
}

m.commands.help = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user)) {
    return ctx.reply(
      "<b>Tokens</b>\n" +
      " ● /add_token<code>   - Generate new token</code>\n" +
      " ● /show_tokens<code> - Show all generate tokens</code>\n" +
      "\n" +
      "<b>Files</b>\n" +
      " ● /add_files<code>  - Add new file to servers</code>\n" +
      " ● /show_files<code> - Show all server files</code>\n" +
      "\n" +
      "<b>Users</b>\n" +
      " ● /show_users<code> - Show all registered users</code>\n",
      { parse_mode: "HTML" })
  } else {
    return ctx.reply(
      "<b>Me</b>\n" +
      " ● /register<code> - Register to server</code>\n" +
      "\n" +
      "<b>Files</b>\n" +
      " ● /show_files<code> - Show my downloadable files</code>\n",
      { parse_mode: "HTML" })
  }
}

m.commands.register = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (user.props.registered) {
    await ctx.reply(
      '✅ <b>Already registered</b>',
      { parse_mode: "HTML" })
  } else {
    await ctx.reply(
      '<b>Enter <u>token key</u></b>',
      { parse_mode: "HTML" })
    actions
      .add(ctx.from, 'text')
      .then(async key => {
        const result = await tokens.register(key.message, user)
        //
        switch (result) {
          case tokens.errorTokenInvalidKey: {
            await ctx.reply(
              '❌ <b>Invalid token!</b>',
              { parse_mode: "HTML" })
          } break
          case tokens.errorTokenUsersLimit: {
            await ctx.reply(
              '❌ <b>Reached users limit!</b>',
              { parse_mode: "HTML" })
          } break
          default: {
            await ctx.reply(
              '✅ <b>Successfully registered</b>',
              { parse_mode: "HTML" })
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
  else {
    if (!user.props.registered)
      return m.commands.register(ctx)
    return m.menus.show(ctx, m.menus.userFiles)
  }
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

m.commands.readFile = async function read_file(conversation, ctx) {
  // read file document
  await ctx.reply(
    "📄 <b>Send <u>document</u></b>\n" +
    " ● <code>Drag & drop your file</code>\n" +
    " ● <code>Forward it</code>",
    { parse_mode: "HTML" })
  const { msg : { document : document } } =
    await conversation.waitFor('message:document')
  console.log(document)
  // read file title
  await ctx.reply(
    "📝️ <b>Send <u>title</u></b>\n" +
    " ● <code>Make sure it's correct!</code>",
    { parse_mode: "HTML" })
  const { message : { document : title } } =
    await conversation.waitFor('message:text')
  // read file description
  await ctx.reply(
    "📝️ <b>Send <u>description</u></b>\n" +
    " ● <code>Make sure it's correct!</code>",
    { parse_mode: "HTML" })
  const { message : { document : description } } =
    await conversation.waitFor('message:text')
  // add file
  await files.add(document, title, description)
  //
  await ctx.reply(
    `✅ <code>Add successfully</code>`,
    { parse_mode: "HTML" })
}

m.commands.readToken = async function read_token(conversation, ctx) {
  // read token name
  await ctx.reply(
      "🔑 <b>Set <u>token name</u></b>\n",
      { parse_mode: "HTML" })
  const { message : { text : name} }
    = await conversation.waitFor("message:text");
  // read token users limit
  await ctx.reply(
    "🔑 <b>Set <u>users limit</u></b>\n",
    { parse_mode: "HTML" })
  const { message : { text : limitUsers} }
    = await conversation.waitFor("message:text");
  // add token
  const result = await tokens.add(name, limitUsers)
  // show token key
  await ctx.reply(
    `<b>Key: </b><code>${result.key}</code>`,
    { parse_mode: "HTML" })
}

m.commands.addFile = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await ctx.conversation.enter('read_file')
}

m.commands.addToken = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await ctx.conversation.enter('read_token')
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


// conversation
global.bot.use(global.ext.conversation.createConversation(m.commands.readFile));
global.bot.use(global.ext.conversation.createConversation(m.commands.readToken));
//
global.bot.command('start', m.commands.start)
global.bot.command('help' , m.commands.help)
// user
global.bot.command('register', m.commands.register)
// show
global.bot.command('show_files' , m.commands.showFiles)
global.bot.command('show_users' , m.commands.showUsers)
global.bot.command('show_tokens', m.commands.showTokens)
// add
global.bot.command('add_file' , m.commands.addFile)
global.bot.command('add_token', m.commands.addToken)
