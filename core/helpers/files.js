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


m.userToggle = async function (user, file) {
  const contain = await m.userContain(user, file)
  //
  await user.fragment('files').set({
    [file.key]: contain? m.fileNotExist : m.fileExist  // reverse file status
  })
  return !contain
}

m.userContain = async function (user, file) {
  for (const fragment of await user.fragment('files').get())
    if (fragment.props[file.key] === m.fileExist)
      return true
  return false
}


m.all = async function () {
  return Promise.all(
    (await global.tables.files.list())
      .results
      .map(file => global.tables.files.get(file.key))
  )
}
