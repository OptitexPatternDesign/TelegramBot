const global = require("./core/global")

const actions = require("./core/actions")

const users  = require("./core/helpers/users")
const files  = require("./core/helpers/files")
const tokens = require("./core/helpers/tokens")


global.bot.use(global.telegram.session({
  initial: () => ({
    activeUser: null,
    activeFile: null
  })
}));

require('./core/out/commands')
const {isAdmin} = require("./core/helpers/users");

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
    users.all().then(all =>
      all.forEach(async user => {
        console.log(user, users.isUser(user))
        if (users.isUser(user))
          await global.tables.users.delete(user.key)
      }))
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
  } break;
}