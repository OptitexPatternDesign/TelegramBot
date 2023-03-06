const m = exports
//
const global = require("./../global")


m.table = global.tables.users

m.typeUser  = 'user'
m.typeAdmin = 'admin'


m.get = async function (key) {
  return await m.table.get(key)
}

m.add = async function (who) {
  const record = await m.table.set(who.id.toString(), {
    id  : who.id,
    type: global.admins.includes(who.id) ? m.typeAdmin : m.typeUser,
    //
     username: who.username   || '',
    firstName: who.first_name || '',
     lastName: who. last_name || ''
  })
  //
  return record
}

m.check = async function (who) {
  let user = await m.get(who.id.toString())
  if (user == null)  // create user if not exists
    user = await m.add(who)
  //
  return user
}


m.name = function (user) {
  return user.props.firstName + (user.props.lastName && ` ${user.props.lastName}`)
}

m.username = function (user) {
  return user.props.username ? `@${user.props.username}` : ''
}


m.isUser = function (user) {
  return user.props.type === m.typeUser;
}

m.isAdmin = function (user) {
  return user.props.type === m.typeAdmin;
}


m.all = async function () {
  return Promise.all(
    (await m.table.list())
      .results
      .map(user => m.get(user.key))
  )
}
