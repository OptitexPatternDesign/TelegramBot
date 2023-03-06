const global = require("../global")


global.bot.api.setMyCommands([
  {command: "start"         , description: "Begin the robot"},
  {command: "help"          , description: "Show commands help"},
  {command: "register"      , description: "Register to server"},
  {command: "show_files"    , description: "Show your downloadable files"},
]).then();


// :: Install 'Conversations'
require('./conversations')._install()

// :: Install 'Menus'
require('./menus')._install()

// :: Install 'Commands'
require('./commands')._install()
