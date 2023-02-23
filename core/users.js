const global = require('./global')


const user  = exports.user  = 'user'
const admin = exports.admin = 'admin'

const check = exports.check = async function (who) {
  let user = await global.tables.users.get(who.id.toString())
  if (user == null)  // create user if not exists
    user = await add(who)
  //
  return user
}

const add = exports.add = async function (who) {
  const user = await global.tables.users.set(who.id.toString(), {
    id  : who.id,
    type: who.id === 379343384 ? user : admin,
    //
    username : who.username,
    firstName: who.first_name,
     lastName: who.last_name
  })
  user.fragment('files')
  //
  return user
}

const isAdmin = exports.isAdmin = function (user) {
  //
  return user.props.type === admin;
}