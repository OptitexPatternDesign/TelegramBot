const global = require("./core/global")

const actions = require("./core/actions")

const users  = require("./core/helpers/users")
const files  = require("./core/helpers/files")
const tokens = require("./core/helpers/tokens")


// Install the session
global.bot.use(global.telegram.session({
  initial: () => ({
    activeUser : null,
    activeFile : null,
    activeToken: null
  })
}));

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
    // users.all().then(all =>
    //   all.forEach(async user => {
    //     await global.tables.users.delete(user.key)
    //   }))
    //
    global.app.use(global.server.json())
    global.app.use(global.telegram.webhookCallback(global.bot, 'express'))
    // start the server
    global.app.listen(global.config.port, async () => {
      console.log("Server has been started...")
      // set public webhook
      await global.bot.api.setWebhook('https://opd-bot.cyclic.app')
    })
  } break;
}