const global = require("./core/global")

// const users  = require("./core/helpers/users")
// const files  = require("./core/helpers/files")
// const tokens = require("./core/helpers/tokens")


// Install the session
global.bot.use(global.telegram.session({
  initial: () => ({
    activeUser : null,
    activeFile : null,
    activeToken: null
  })
}));
// Install conversations handler
global.bot.use(global.ext.conversation.conversations())

// Install bot interface
require('./core/out/interface')

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