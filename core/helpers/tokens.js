const m = exports
//
const global = require("./../global")
//
const {generate} = require('randomstring')


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


m.addUser = async function(token, user) {
  if (token.props.users.length < token.props.limitUsers) {
    token.props.users.push(user.key)
    return token
  }
  return null
}


m.all = async function () {
  return Promise.all(
    (await global.tables.tokens.list())
      .results
      .map(file => global.tables.tokens.get(file.key))
  )
}
