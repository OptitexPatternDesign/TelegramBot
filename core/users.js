const global = require('./global')

user  = exports.user  = 'user'
admin = exports.admin = 'admin'

const check = exports.check = async function (who) {
  let user = await global.tables.users.get(who.id.toString())
  if (user == null) {
    user = await add(who)
  }
  console.log('exist', user, user.props)
  return user
}

const add = exports.add = async function (who) {
  console.log('create asdf')
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