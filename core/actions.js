const global = require('./global')


const add = exports.add = function (user, type, run, del) {
  if (global.actions[user.id] != null)
    global.actions[user.id].del()
  global.actions[user.id] = {
    type: type,
    //
    run: run,
    del: del
  }
}

const get = exports.get = function (user) {
  return global.actions[user.id]
}
