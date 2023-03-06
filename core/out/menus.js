const m = exports
//
const global = require("../global");
//
const files     = require("../helpers/files");
const tokens    = require("../helpers/tokens");
const users     = require("../helpers/users");
const sessions  = require("../helpers/sessions");
//
const commands = require("./commands")


m.params = {
  onMenuOutdated: async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.deleteMessage()
  }
}


m.replace = function (ctx, menu, text=null) {
  ctx.menu.nav(menu.id)
  // change menu text
  ctx.editMessageText(text || menu.text(ctx),
    { parse_mode: "HTML" })
}

m.show = function (ctx, menu, text=null) {
  return ctx.reply(text || menu.text(ctx),
    { parse_mode: "HTML", reply_markup: menu })
}


m.adminFiles
  = new global.ext.menu.Menu('admin-files', m.params)
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
      .text(file.props.title,
        (ctx) => {
          ctx.session.activeFile = file
          //
          m.replace(ctx, m.editFile)
        })
      .row()
  })
  .text('📄 Add new file',
    (ctx) =>
      commands.addFile(ctx))
m.adminFiles
  .text = () =>
  "📄 <b>Server <u>files</u></b>\n" +
  " ● <code>Edit file</code> 📄\n" +
  " ● <code>Add new file</code> 📄\n"

m.userFiles =
  new global.ext.menu.Menu('user-files', m.params)
  .dynamic(async (ctx, range) => {
    const user  = await users.check(ctx.from)
    const token = await tokens.get(user.props.registered)
    //
    for (const file of await files.token(token))
      range
      .text(file.props.title,
        (ctx) =>
          commands.sendFile(ctx, file))
      .row()
  })
m.userFiles
  .text = () =>
  "📄 <b>Your accessible <u>files</u></b>\n" +
  "<code>Click on your file to download it, َAnd pay attention to description!</code>\n"

m.editFile =
  new global.ext.menu.Menu('edit-file', m.params)
  .text('📄 Document',
    async (ctx) =>
      await ctx.conversation.enter('change_file_document'))
  .text('📝️ Title',
    async (ctx) =>
      await ctx.conversation.enter('change_file_title'))
  .text('📝️ Description',
    async (ctx) =>
      await ctx.conversation.enter('change_file_description'))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await files.delete(ctx.session.activeFile)
      //
      m.replace(ctx, m.adminFiles)
    })
  .row()
  .text('↩',
    (ctx) =>
      m.replace(ctx, m.adminFiles))
m.editFile
  .text = (ctx) =>
  ` ⚠ <b>You are editing '${ctx.session.activeFile.props.title}'</b>`

m.users =
  new global.ext.menu.Menu('users', m.params)
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user) && user.props.registered)
        range
        .text(users.name(user),
          async (ctx) => {
            ctx.session.activeUser  = user
            ctx.session.activeToken = await tokens.get(user.props.registered)
            // move to new menu
            m.replace(ctx, m.editUser)
          })
        .row()
  })
m.users
  .text = () =>
  "👤 <b>All <u>users</u></b>\n" +
  " ● <code>Change access to files</code> 📄"

m.editUser =
  new global.ext.menu.Menu('edit-user', m.params)
  .text('📄 Files',
    (ctx) =>
      m.replace(ctx, m.editUserFiles))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.unregister(ctx.session.activeUser)
      //
      m.replace(ctx, m.users)
    })
  .row()
  .text('↩',
    (ctx) =>
      m.replace(ctx, m.users))
m.editUser
  .text = (ctx) =>
  `<b>You are editing '${users.name(ctx.session.activeUser)}'</b>\n` +
  ` ⚠️ <code>Any change will apply!</code>`

m.editUserFiles =
  new global.ext.menu.Menu('edit-user-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.update(ctx, 'token')
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
      m.replace(ctx, m.editUser))
m.editUserFiles
  .text = (ctx) =>
  `<b>Change '${users.name(ctx.session.activeUser)}' files access</b>`

m.tokens =
  new global.ext.menu.Menu('tokens', m.params)
  .dynamic(async (ctx, range) => {
    for (const token of await tokens.all()) {
      range
      .text(`${token.props.name}`,
        (ctx) => {
          ctx.session.activeToken = token
          // move to new menu
          m.replace(ctx, m.editToken)
        })
      .row()
    }
  })
  .text('🔑 Generate new token',
    (ctx) =>
      commands.addToken(ctx))
m.tokens
  .text = () =>
  '<b>Tokens</b>'

m.editToken =
  new global.ext.menu.Menu('edit-token', m.params)
  .text('📄 Files',
    async (ctx) =>
      m.replace(ctx, m.editTokenFiles))
  .text('👤 Users',
    async (ctx) =>
      m.replace(ctx, m.editTokenUsers))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.delete(ctx.session.activeToken)
      //
      m.replace(ctx, m.tokens)
    })
  .row()
  .text('↩',
    (ctx) =>
      m.replace(ctx, m.tokens))
m.editToken
  .text = (ctx) =>
  ` ⚠ <b>You are editing '${ctx.session.activeToken.props.name}'</b>\n` +
  ` ● <b>Key: </b><code>${ctx.session.activeToken.key}</code>\n` +
  ` ● <b>Users: </b><code>${ctx.session.activeToken.props.users.length} / ${ctx.session.activeToken.props.limitUsers}</code>\n`

m.editTokenFiles =
  new global.ext.menu.Menu('edit-token-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.update(ctx, 'token')
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
      m.replace(ctx, m.editToken))
m.editTokenFiles
  .text = (ctx) =>
  `<b>Change '${ctx.session.activeToken.props.name}' files access</b>`

m.editTokenUsers =
  new global.ext.menu.Menu('edit-token-users', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.update(ctx, 'token')
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
      m.replace(ctx, m.editToken))
m.editTokenUsers
  .text = (ctx) =>
  `<b>Change '${ctx.session.activeToken.props.name}' users</b>`


/*
 *
 */
m._install = function() {
  // :: Install and Register 'Menus'
  global.bot.use(m.tokens)
  m.tokens   .register(m.editToken)
  m.editToken.register(m.editTokenUsers)
  m.editToken.register(m.editTokenFiles)
  //
  global.bot.use(m.adminFiles)
  m.adminFiles.register(m.editFile)
  //
  global.bot.use(m.userFiles)
  //
  global.bot.use(m.users)
  m.users   .register(m.editUser)
  m.editUser.register(m.editUserFiles)
}
