const global = require("./global")

const actions = require("./actions")

const users = require("./helpers/users")
const files = require("./helpers/files")


global.bot.api.setMyCommands([
  {command: "start", description: "Begin the robot"},
  {command: "files", description: "Show your core"},
]).then();


async function filesAdmin(ctx) {
  const allFiles = await files.files()
  const menu = new global.ext.menu.Menu('test')
    .text('Hi')
  global.bot.use(menu)
  for (const f of allFiles)
    menu.text(f.props.title).row()
  menu.text('Add file...', (ctx) => console.log('asdf')).row()
  menu.text('Back').row()
  global.bot.use(menu)
  //
  return ctx.reply('Download core', { reply_markup: menu })
}

async function filesUser(ctx) {
  const files = files.all()
  // create menu
  const menu = new global.telegram.InlineKeyboard()
  files.forEach(file => {
    console.log("asdf")
    console.log(file, file.props)
  })
  menu.text('Back', 'back').row()
  //
  return ctx.reply('Download core', { reply_markup: menu })
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
    })
    })
    })
}

async function cmdGetFile(ctx) {

}


// core
global.bot.command('files', cmdFiles)
global.bot.command('add_file', cmdAddFile)
global.bot.callbackQuery('add_file', cmdAddFile)
global.bot.command('get_file:.*', cmdGetFile)