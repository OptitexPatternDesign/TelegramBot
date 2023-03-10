const m = exports
//
const global = require("./../global")
//
const users = require("../helpers/users")
//
const {generate} = require('randomstring')


m.table = global.tables.tokens

m.errorTokenInvalidKey = 'invalid key'
m.errorTokenUsersLimit = 'limits reached'


m.get = async function (key) {
  return await m.table.get(key)
}

m.add = async function (name, limitUsers) {
  const key = generate()
  //
  const record = await m.table.set(key, {
    id  : key,
    name: name,
    //
    limitUsers: parseInt(limitUsers),
    //
    users: []
  })
  await record.fragment('files').set({})
  //
  return record
}

m.delete = async function (token) {
  for (const userKey of token.props.users)
    users.get(userKey).then(user => {
      user.set({
        registered: null
      })
    })
  await m.table.delete(token.key)
}


m.addUser = async function (token, user) {
  if (token.props.users.length < token.props.limitUsers) {
    token.set({
      users: token.props.users.concat(user.key)
    })
    user.set({
      registered: token.key
    })
    //
    return token
  }
  return m.errorTokenUsersLimit;
}

m.deleteUser = async function (token, user) {
  token.set({
    users: token.props.users.filter(i => i !== user.key)
  })
}


m.users = async function (token) {
  return Promise.all(
    token.props.users
      .map(i => users.get(i))
  )
}


m.register = async function (key, user) {
  const token = await m.get(key)
  if (token == null)
    return m.errorTokenInvalidKey;
  //
  return m.addUser(token, user)
}

m.unregister = async function (user) {
  if (user.props.registered) {
    const token = await m.get(user.props.registered)
    //
    await m.deleteUser(token, user)
    user.set({
      registered: null
    })
  }
}


m.all = async function () {
  return Promise.all(
    (await m.table.list())
      .results
      .map(file => m.get(file.key))
  )
}
