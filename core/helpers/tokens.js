const m = exports
//
const global = require("./../global")
//
const users  = require("../helpers/users")
//
const {generate} = require('randomstring')


m.errorTokenInvalidKey = 'invalid key'
m.errorTokenUsersLimit = 'limits reached'

m.get = async function (key) {
  return await global.tables.tokens.get(key)
}

m.add = async function (name, limitUsers) {
  const key = generate()
  //
  const record = await global.tables.tokens.set(key, {
    id  : key,
    name: name.text,
    //
    limitUsers: parseInt(limitUsers.text),
    //
    users: []
  })
  //
  return record
}

m.delete = async function (token) {
  for (const userKey of token.props.users) {
    const user = await users.get(userKey)
    user.set({
      registered: null
    })
  }
  global.tables.tokens.delete(token.key)
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


m.register = async function (key, user) {
  const token = await global.tables.tokens.get(key.text)
  if (token == null)
    return m.errorTokenInvalidKey;
  //
  return m.addUser(token, user)
}

m.unregister = async function (user) {
  if (user.props.registered) {
    const token = await global.tables.tokens.get(user.props.registered)
    //
    await m.deleteUser(token, user)
    user.set({
      registered: null
    })
  }
}


m.all = async function () {
  return Promise.all(
    (await global.tables.tokens.list())
      .results
      .map(file => global.tables.tokens.get(file.key))
  )
}
