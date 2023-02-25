const m = exports
//
const global = require("./../global")


m.fileExist    = '+'
m.fileNotExist = '-'

m.add = async function (file, title, description) {
  const record = await global.tables.files.set(file.document.file_unique_id, {
           id: file.document.file_id,
    unique_id: file.document.file_unique_id,
    //
    name: file.document.name,
    type: file.document.mime_type,
    //
    title      : title.text,
    description: description.text
  })
  //
  return record
}


m.toggle = async function (user, file) {
  const files = user.fragment('files')
  if (await m.status(user, file)) {
    console.log("delete", file)
    await files.set({[file.key]: m.fileNotExist})
    return false;
  } else {
    console.log("add", file)
    await files.set({[file.key]: m.fileExist})
    return true
  }
}

m.status = async function (user, file) {
  for (const fragment of await user.fragment('files').get()) {
    console.log('props', fragment.props, fragment.props[file.key])
    if (fragment.props[file.key] && fragment.props[file.key] === m.fileExist)
      return true
  }
  return false
}


m.all = async function () {
  return Promise.all(
    (await global.tables.files.list())
      .results
      .map(file => global.tables.files.get(file.key))
  )
}
