const global = require("./core/global")

const actions = require("./core/actions")

const users = require("./core/helpers/users")

global.bot.command("start", async (ctx) => {
  await users.check(ctx.from)
  //
  return ctx.reply('Welcome')
})

require('./core/out/commands')

global.bot.on('message:document', (ctx) => {
  const action = actions.get(ctx.from)
  if (action && action.type === 'document')
    action.trigger(ctx)
})

global.bot.on('message:text', (ctx) => {
  const action = actions.get(ctx.from)
  if (action && action.type === 'text')
    action.trigger(ctx)
})

switch (process.env.BOT_ENV) {
  default:
  case "release":
  case "production": {
    // global.tables.users.list().then(res => {res.results.forEach(async (user,) => {await global.tables.users.delete(user.key)})})
    // global.tables.core.list().then(res => {res.results.forEach(async (file,) => {await global.tables.core.delete(file.key)})})
    //
    global.app.use(global.server.json())
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    // start the server
    global.app.listen(global.config.port, () => {
      console.log("Started the server!")
      // set public webhook
      global.bot.api.setWebhook('https://opd-bot.cyclic.app')
        .then(res => {
        })
        .catch(err => {
        })
    })
  }
    break;
}