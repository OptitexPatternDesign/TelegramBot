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


m.show = async function (ctx, menu, text=null) {
  return ctx.reply(text || await menu.text(ctx),
    { parse_mode: "HTML", reply_markup: menu })
}

m.replace = async function (ctx, menu, text=null) {
  ctx.menu.nav(menu.id)
  // change menu text
  ctx.editMessageText(text || await menu.text(ctx),
    { parse_mode: "HTML" })
}


m.adminFiles
  = new global.ext.menu.Menu('admin-files', m.params)
  .dynamic(async (ctx, range) => {
    for (const file of await files.all())
      range
      .text(file.props.title,
        async (ctx) => {
          ctx.session.activeFile = file.key
          //
          await m.replace(ctx, m.editFile)
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
      await files.delete(await sessions.get(ctx, 'file'))
      //
      await m.replace(ctx, m.adminFiles)
    })
  .row()
  .text('↩',
    async (ctx) =>
      await m.replace(ctx, m.adminFiles))
m.editFile
  .text = async (ctx) => {
  const file = await sessions.get(ctx, 'file')
  return (
    ` ⚠ <b>You are editing '${file.props.title}'</b>`)}

m.users =
  new global.ext.menu.Menu('users', m.params)
  .dynamic(async (ctx, range) => {
    for (const user of await users.all())
      if (users.isUser(user) && user.props.registered)
        range
        .text(users.name(user),
          async (ctx) => {
            ctx.session.activeUser  = user.key
            ctx.session.activeToken = user.props.registered
            // move to new menu
            await m.replace(ctx, m.editUser)
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
    async (ctx) =>
      await m.replace(ctx, m.editUserFiles))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.unregister(await sessions.get(ctx, 'user'))
      //
      await m.replace(ctx, m.users)
    })
  .row()
  .text('↩',
    async (ctx) =>
      await m.replace(ctx, m.users))
m.editUser
  .text = async (ctx) => {
  const user = await sessions.get(ctx, 'user')
  return (
    `<b>You are editing '${users.name(user)}'</b>\n` +
    ` ⚠️ <code>Any change will apply!</code>`)}

m.editUserFiles =
  new global.ext.menu.Menu('edit-user-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.get(ctx, 'token')
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
    async (ctx) =>
      await m.replace(ctx, m.editUser))
m.editUserFiles
  .text = async (ctx) => {
  const user = await sessions.get(ctx, 'user')
  return (
    `<b>Change '${users.name(user)}' files access</b>`)}

m.tokens =
  new global.ext.menu.Menu('tokens', m.params)
  .dynamic(async (ctx, range) => {
    for (const token of await tokens.all()) {
      range
      .text(`${token.props.name}`,
        async (ctx) => {
          ctx.session.activeToken = token.key
          // move to new menu
          await m.replace(ctx, m.editToken)
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
      await m.replace(ctx, m.editTokenFiles))
  .text('👤 Users',
    async (ctx) =>
      await m.replace(ctx, m.editTokenUsers))
  .row()
  .text('❌ Delete',
    async (ctx) => {
      await tokens.delete(await sessions.get(ctx, 'token'))
      //
      await m.replace(ctx, m.tokens)
    })
  .row()
  .text('↩',
    async (ctx) =>
      await m.replace(ctx, m.tokens))
m.editToken
  .text = async (ctx) => {
  const token = await sessions.get(ctx, 'token')
  return (
    ` ⚠ <b>You are editing '${token.props.name}'</b>\n` +
    ` ● <b>Key: </b><code>${token.key}</code>\n` +
    ` ● <b>Users: </b><code>${token.props.users.length} / ${token.props.limitUsers}</code>\n`)}

m.editTokenFiles =
  new global.ext.menu.Menu('edit-token-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.get(ctx, 'token')
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
    async (ctx) =>
      await m.replace(ctx, m.editToken))
m.editTokenFiles
  .text = async (ctx) => {
  const token = await sessions.get(ctx, 'token')
  return (
    `<b>Change '${token.props.name}' files access</b>`)}

m.editTokenUsers =
  new global.ext.menu.Menu('edit-token-users', m.params)
  .dynamic(async (ctx, range) => {
    const token = await sessions.get(ctx, 'token')
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
    async (ctx) =>
      await m.replace(ctx, m.editToken))
m.editTokenUsers
  .text = async (ctx) => {
  const token = await sessions.get(ctx, 'token')
  return (
    `<b>Change '${token.props.name}' users</b>`)}


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
