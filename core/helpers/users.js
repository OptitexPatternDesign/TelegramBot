const m = exports
//
const global = require("./../global")


const typeUser  = exports.user  = 'user'
const typeAdmin = exports.admin = 'admin'

m.check = async function (who) {
  let user = await global.tables.users.get(who.id.toString())
  if (user == null)  // create user if not exists
    user = await m.add(who)
  //
  return user
}

m.add = async function (who) {
  const record = await global.tables.users.set(who.id.toString(), {
    id  : who.id,
    type: (who.id === 379343384) ? typeAdmin : typeUser,
    //
     username: who.username   || '',
    firstName: who.first_name || '',
     lastName: who. last_name || ''
  })
  await record.fragment('files').set({})
  //
  return record
}


m.name = function (user) {
  return user.props.firstName + (user.props.lastName && ` ${user.props.lastName}`)
}

m.username = function (user) {
  return user.props.username ? `@${user.props.username}` : ''
}


m.isUser = function (user) {
  return user.props.type === typeUser;
}

m.isAdmin = function (user) {
  return user.props.type === typeAdmin;
}


m.files = async function (user) {
  return (await user.fragment('files')
    .list())
    .map(file => global.tables.files.get(file.key))
}

m.fileToggle = async function (user, file) {
  const files = user.fragment('files')
  console.log(files)
  if (m.fileStatus(user, file)) {
    console.log("delete", file)
    await files.delete({[file.key]: ''})
    return false;
  } else {
    console.log("add", file)
    await files.set({[file.key]: ''})
    return true
  }
}

m.fileStatus = async function (user, file) {
  const files = await user.fragment('files').get()
  console.log(files, files.props)
}


m.all = async function () {
  return Promise.all(
    (await global.tables.users.list())
      .results
      .map(user => global.tables.users.get(user.key))
  )
}
