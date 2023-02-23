const global = require('./global')

exports.userCheck = function (id) {
  return global.tables.users.get(id)
}

exports.userAdd = function (who) {
  console.log(who)
}