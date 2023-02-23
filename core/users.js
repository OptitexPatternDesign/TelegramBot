const global = require('./global')

user  = exports.user  = 'user'
admin = exports.admin = 'admin'

check = exports.check = async function (who) {
  const user = await global.tables.users.get(who.id.toString())
  console.log(user)
  return user
  // return global.tables.users.get(who.id.toString())
  //   .then(user => {
  //     if (user == null)
  //       user = add(who)
  //     return user
  //   })
}

add = exports.add = function (who) {

  return global.tables.users.set(who, {
    type: user
  })
}