const m = exports
//
const global = require("../global");
//
const users = require("../helpers/users");
//
const menus = require("./menus")


m.start = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  return ctx.reply(
    `<b>Welcome <u>${users.name(user)}</u></b>\n` +
    ` ● <code>ID: ${user.key}</code>`,
    { parse_mode: "HTML" })
}

m.help = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user)) {
    return ctx.reply(
      "<b>Tokens</b>\n" +
      " ● /add_token<code>   - Generate new token</code>\n" +
      " ● /show_tokens<code> - Show all generate tokens</code>\n" +
      "\n" +
      "<b>Files</b>\n" +
      " ● /add_file<code>  - Add new file to servers</code>\n" +
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

m.register = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (user.props.registered) {
    await ctx.reply(
      '✅ <b>Already registered</b>',
      { parse_mode: "HTML" })
  } else
    await ctx.conversation.enter('register')
}

m.showFiles = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return menus.show(ctx, menus.adminFiles)
  else {
    if (!user.props.registered)
      return m.register(ctx)
    return menus.show(ctx, menus.userFiles)
  }
}

m.showUsers = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return menus.show(ctx, menus.users)
}

m.showTokens = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    return menus.show(ctx, menus.tokens)
}

m.addFile = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await ctx.conversation.enter('read_file')
}

m.addToken = async function (ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await ctx.conversation.enter('read_token')
}

m.sendFile = async function (ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}


/*
 *
 */
m._install = function () {
  global.bot.command('start', m.start)
  global.bot.command('help' , m.help)
  // user
  global.bot.command('register', m.register)
  // show
  global.bot.command('show_files' , m.showFiles)
  global.bot.command('show_users' , m.showUsers)
  global.bot.command('show_tokens', m.showTokens)
  // add
  global.bot.command('add_file' , m.addFile)
  global.bot.command('add_token', m.addToken)
}