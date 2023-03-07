const m = exports
//
const global = require("../global");
//
const files   = require("../helpers/files");
const tokens  = require("../helpers/tokens");
const users   = require("../helpers/users");
const session = require("../helpers/session");


m.readFile = async function
  read_file(conversation, ctx) {
  // read file document
  await ctx.reply(
    "📄 <b>Send <u>document</u></b>\n" +
    " ● <code>Drag & drop your file</code>\n" +
    " ● <code>Forward it</code>",
    { parse_mode: "HTML" })
  const { message : { document : document } } =
    await conversation.waitFor('message:document')
  // read file title
  await ctx.reply(
    "📝️ <b>Send <u>title</u></b>\n" +
    " ● <code>Make sure it's correct!</code>",
    { parse_mode: "HTML" })
  const { message : { text : title } } =
    await conversation.waitFor('message:text')
  // read file description
  await ctx.reply(
    "📝️ <b>Send <u>description</u></b>\n" +
    " ● <code>Make sure it's correct!</code>",
    { parse_mode: "HTML" })
  const { message : { text : description } } =
    await conversation.waitFor('message:text')
  // add file
  await files.add(document, title, description)
  //
  await ctx.reply(
    `✅ <b>Added successfully</b>`,
    { parse_mode: "HTML" })
}

m.readToken = async function
  read_token(conversation, ctx) {
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

m.changeFileDocument = async function
  change_file_document(conversation, ctx) {
  const file = await session.get(ctx, 'file')
  if  (!file) return
  //
  await ctx.reply(
    "📄 <b>Update <u>file document</u></b>\n",
    { parse_mode: "HTML" })
  const { message : { document : document } } =
    await conversation.waitFor('message:document')
  //
  await files.update(file, document, null, null)
}

m.changeFileTitle = async function
  change_file_title(conversation, ctx) {
  const file = await session.get(ctx, 'file')
  if  (!file) return
  //
  await ctx.reply(
    "📄 <b>Update <u>file title</u></b>\n",
    { parse_mode: "HTML" })
  const { message : { text : title } } =
    await conversation.waitFor('message:text')
  //
  await files.update(file, null, title, null)
}

m.changeFileDescription = async function
  change_file_description(conversation, ctx) {
  const file = await session.get(ctx, 'file')
  if  (!file) return
  //
  await ctx.reply(
    "📄 <b>Update <u>file description</u></b>\n",
    { parse_mode: "HTML" })
  const { message : { text : description } } =
    await conversation.waitFor('message:text')
  //
  await files.update(file, null, null, description)
}

m.register = async function
  register(conversation, ctx) {
  const user = await users.check(ctx.from)
  //
  await ctx.reply(
    '<b>Enter <u>token key</u></b>',
    { parse_mode: "HTML" })
  const { message : { text : key } } =
    await conversation.waitFor('message:text')
  //
  const result = await tokens.register(key, user)
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
}


/*
 *
 */
m._install = function () {
  global.bot.use(global.ext.conversation.createConversation(m.readFile));
  global.bot.use(global.ext.conversation.createConversation(m.readToken));
  //
  global.bot.use(global.ext.conversation.createConversation(m.changeFileDocument));
  global.bot.use(global.ext.conversation.createConversation(m.changeFileTitle));
  global.bot.use(global.ext.conversation.createConversation(m.changeFileDescription));
  //
  global.bot.use(global.ext.conversation.createConversation(m.register));
}
