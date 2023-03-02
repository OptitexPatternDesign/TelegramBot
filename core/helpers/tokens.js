const m = exports
//
const global = require("./../global")
//
const {generate} = require('randomstring')


m.errorTokenInvalidKey = 'invalid key'
m.errorTokenUsersLimit = 'limits reached'

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


m.addUser = async function (token, user) {
  console.log(token)
  if (token.props.users.length < token.props.limitUsers) {
    console.log("add", user.props)
    token.set({
      users: token.props.users.concat(user.key)
    })
    user.set({
      registered: true
    })
    //
    return token
  }
  return m.errorTokenUsersLimit;
}


m.register = async function (key, user) {
  const token = await global.tables.tokens.get(key.text)
  if (token == null)
    return m.errorTokenInvalidKey;
  //
  return m.addUser(token, user)
}


m.all = async function () {
  return Promise.all(
    (await global.tables.tokens.list())
      .results
      .map(file => global.tables.tokens.get(file.key))
  )
}
