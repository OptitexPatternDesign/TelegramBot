const global = require('./global')


const add = exports.add = function (user, type) {
  return new Promise(((resolve, reject) => {
    global.actions[user.id] = {
      type: type,
      //
      trigger: (ctx) => resolve(ctx)
    }
  }))
}

const get = exports.get = function (user) {
  return global.actions[user.id]
}
