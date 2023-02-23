const global = require('./global')

exports.checkUser = function (id) {
  return global.tables.users.get(id)
}