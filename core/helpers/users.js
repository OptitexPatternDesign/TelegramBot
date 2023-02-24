const global = require("./../global")


const typeUser  = exports.user  = 'user'
const typeAdmin = exports.admin = 'admin'

const check = exports.check = async function (who) {
  let user = await global.tables.users.get(who.id.toString())
  if (user == null)  // create user if not exists
    user = await add(who)
  //
  return user
}

const add = exports.add = async function (who) {
  const record = await global.tables.users.set(who.id.toString(), {
    id  : who.id,
    type: (who.id === 379343384) ? typeAdmin : typeUser,
    //
     username: who.username,
    firstName: who.first_name,
     lastName: who.last_name
  })
  record.fragment('files')
  //
  return record
}

const isUser = exports.isUser = function (user) {
  //
  return user.props.type === typeUser;
}

const isAdmin = exports.isAdmin = function (user) {
  //
  return user.props.type === typeAdmin;
}

const files = exports.files = async function (user) {
  //
  return (await user.fragment('files')
    .list())
    .map(file => global.tables.files.get(file.key))
}
