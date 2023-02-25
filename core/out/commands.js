const global = require("../global")

const actions = require("../actions")

const users = require("../helpers/users")
const files = require("../helpers/files")


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your core"},
]).then();

const adminFiles = new global.ext.menu.Menu('admin-files')
  .dynamic(async (ctx, range) => {
    function addFile(file) {
      range
        .text(file.props.title, (ctx) => sendFile(ctx, file))
        .row()
    }

    for (const file of await files.files())
      range
        .text(file.props.title, (ctx) => sendFile(ctx, file))
        .row()
  })
  .text('Add new file', cmdAddFile)
  .back('↩')


global.bot.use(adminFiles)

async function sendFile(ctx, file) {
  await ctx.replyWithDocument(file.props.id, {
    caption:
      `<b>${file.props.title}</b>\n` +
      `\n` +
      `${file.props.description}`,
    parse_mode: "HTML"
  })
}

async function filesAdmin(ctx) {
  return ctx.reply('Download core', {
    reply_markup: adminFiles,
    parse_mode: "HTML"
  })
}

async function filesUser(ctx) {
}


async function cmdFiles(ctx) {
  const user = await users.check(ctx.from)
  //
  if (users.isAdmin(user))
    await filesAdmin(ctx)
  else
    await filesUser(ctx)
}

async function cmdAddFile(ctx) {
  await ctx.reply(
    "📄 <b>Send <u>document</u></b>\n" +
    " ● <code>Drag & drop your file</code>\n" +
    " ● <code>Forward it</code>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'document')
    .then(async file => {
      await ctx.reply(
        "📝️ <b>Send <u>file title</u></b>\n" +
        " ● <code>Make sure it's correct!</code>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async title => {
      await ctx.reply(
        "📝️ <b>Send <u>file Description</u></b>\n" +
        " ● <code>Make sure it's correct!</code>", { parse_mode: "HTML" })
  actions
    .add(ctx.from, 'text')
    .then(async description => {
      await files.add(file.message, title.message, description.message)
    })})})
}



// core
global.bot.command('files', cmdFiles)
global.bot.command('add_file', cmdAddFile)
global.bot.callbackQuery('add_file', cmdAddFile)