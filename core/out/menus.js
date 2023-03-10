const m = exports
//
const global = require("../global");
//
const files   = require("../helpers/files");
const tokens  = require("../helpers/tokens");
const users   = require("../helpers/users");
const session = require("../helpers/session");
//
const commands = require("./commands")


m.params = {
  onMenuOutdated: async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.deleteMessage()
  }
}


m.show = async function (ctx, menu, text=null) {
  return ctx.reply(
    text || await menu.text(ctx),
    { parse_mode: "HTML", reply_markup: menu })
}

m.replace = async function (ctx, menu, text=null) {
  ctx.menu.nav(menu.id)
  // change menu text
  if (!text)
    text = await menu.text(ctx)
  if (text)
    ctx.editMessageText(
      text,
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
  .text('π Add new file',
    (ctx) =>
      commands.addFile(ctx))
m.adminFiles
  .text = () =>
  "π <b>Server <u>files</u></b>\n" +
  " β <code>Edit file</code> π\n" +
  " β <code>Add new file</code> π\n"

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
  "π <b>Your accessible <u>files</u></b>\n" +
  "<code>Click on your file to download it, ΩAnd pay attention to description!</code>\n"

m.editFile =
  new global.ext.menu.Menu('edit-file', m.params)
  .text('π Document',
    async (ctx) =>
      await ctx.conversation.enter('change_file_document'))
  .text('ποΈ Title',
    async (ctx) =>
      await ctx.conversation.enter('change_file_title'))
  .text('ποΈ Description',
    async (ctx) =>
      await ctx.conversation.enter('change_file_description'))
  .row()
  .text('β Delete',
    async (ctx) => {
      const file = await session.get(ctx, 'file')
      if  (!file) return
      //
      await files.delete(file)
      //
      await m.replace(ctx, m.adminFiles)
    })
  .row()
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.adminFiles))
m.editFile
  .text = async (ctx) => {
  const file = await session.get(ctx, 'file')
  if  (!file) return
  return (
    ` β  <b>You are editing '${file.props.title}'</b>`)}

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
  "π€ <b>All <u>users</u></b>\n" +
  " β <code>Change access to files</code> π"

m.editUser =
  new global.ext.menu.Menu('edit-user', m.params)
  .text('π Files',
    async (ctx) =>
      await m.replace(ctx, m.editUserFiles))
  .row()
  .text('β Delete',
    async (ctx) => {
      const user = await session.get(ctx, 'user')
      if  (!user) return
      //
      await tokens.unregister(user)
      // go back
      await m.replace(ctx, m.users)
    })
  .row()
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.users))
m.editUser
  .text = async (ctx) => {
  const user = await session.get(ctx, 'user')
  if  (!user) return
  return (
    `<b>You are editing '${users.name(user)}'</b>\n` +
    ` β οΈ <code>Any change will apply!</code>`)}

m.editUserFiles =
  new global.ext.menu.Menu('edit-user-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await session.get(ctx, 'token')
    if  (!token) return
    //
    for (const file of await files.all())
      range
      .text(`${file.props.title} ${await files.tokenContains(token, file) ? 'β' : 'β'}`,
        async (ctx) => {
          await files.tokenToggle(token, file)
          // update menu buttons
          ctx.menu.update()
        })
      .row()
  })
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.editUser))
m.editUserFiles
  .text = async (ctx) => {
  const user = await session.get(ctx, 'user')
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
  .text('π Generate new token',
    (ctx) =>
      commands.addToken(ctx))
m.tokens
  .text = () =>
  '<b>Tokens</b>'

m.editToken =
  new global.ext.menu.Menu('edit-token', m.params)
  .text('π Files',
    async (ctx) =>
      await m.replace(ctx, m.editTokenFiles))
  .text('π€ Users',
    async (ctx) =>
      await m.replace(ctx, m.editTokenUsers))
  .row()
  .text('β Delete',
    async (ctx) => {
      const token = await session.get(ctx, 'token')
      if  (!token) return
      //
      await tokens.delete(token)
      //
      await m.replace(ctx, m.tokens)
    })
  .row()
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.tokens))
m.editToken
  .text = async (ctx) => {
  const token = await session.get(ctx, 'token')
  if  (!token) return
  return (
    ` β  <b>You are editing '${token.props.name}'</b>\n` +
    ` β <b>Key: </b><code>${token.key}</code>\n` +
    ` β <b>Users: </b><code>${token.props.users.length} / ${token.props.limitUsers}</code>\n`)}

m.editTokenFiles =
  new global.ext.menu.Menu('edit-token-files', m.params)
  .dynamic(async (ctx, range) => {
    const token = await session.get(ctx, 'token')
    if  (!token) return
    //
    for (const file of await files.all())
      range
      .text(`${file.props.title} ${await files.tokenContains(token, file) ? 'β' : 'β'}`,
        async (ctx) => {
          await files.tokenToggle(token, file)
          // update menu buttons
          ctx.menu.update()
        })
      .row()
  })
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.editToken))
m.editTokenFiles
  .text = async (ctx) => {
  const token = await session.get(ctx, 'token')
  if  (!token) return
  return (
    `<b>Change '${token.props.name}' files access</b>`)}

m.editTokenUsers =
  new global.ext.menu.Menu('edit-token-users', m.params)
  .dynamic(async (ctx, range) => {
    const token = await session.get(ctx, 'token')
    if  (!token) return
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
  .text('β©',
    async (ctx) =>
      await m.replace(ctx, m.editToken))
m.editTokenUsers
  .text = async (ctx) => {
  const token = await session.get(ctx, 'token')
  if  (!token) return
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
