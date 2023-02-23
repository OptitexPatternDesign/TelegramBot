const global = require('./global')

user  = exports.user  = 'user'
admin = exports.admin = 'admin'

const check = exports.check = async function (who) {
  const user = await global.tables.users.get(who.id.toString())
  if (user == null) {
    console.log('create')
    add(who)
  }
  return user
}

const add = exports.add = async function (who) {
  return await global.tables.users.set(who.id.toString(), {
    type: user,
    //
    id: who.id,
    username: who.username,
    //
    firstName: who.first_name,
     lastName: who.last_name
  })
}