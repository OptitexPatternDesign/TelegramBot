const global = require('./global')
const {actions} = require("./global");


const add = exports.add = function (user, type, run, del) {
  return new Promise(((resolve, reject) => {
    let action = {
      type: type,
      //
      run: run,
      del: del
    }
    action.trigger = (ctx) => {
      console.log('inside trigger')
      run(ctx)
      resolve(ctx)
    }
    //
    global.actions[user.id] = action
  }))
}

const get = exports.get = function (user) {
  return global.actions[user.id]
}
