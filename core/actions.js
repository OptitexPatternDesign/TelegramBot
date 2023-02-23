const global = require('./global')
const {actions} = require("./global");


const add = exports.add = function (user, type) {
  return new Promise(((resolve, reject) => {
    global.actions[user.id] = {
      type: type,
      //
      trigger: (ctx) => {
        console.log("from trigger")
        resolve(ctx)
      }
    }
  }))
}

const get = exports.get = function (user) {
  return global.actions[user.id]
}
