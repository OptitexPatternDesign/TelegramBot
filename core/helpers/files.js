const m = exports
//
const global = require("./../global")


m.table = global.tables.files

m.fileExist    = '+'
m.fileNotExist = '-'


m.get = async function (key) {
  return await m.table.get(key)
}

m.add = async function (document, title, description) {
  const record = await m.table.set(document.file_unique_id, {
           id: document.file_id,
    unique_id: document.file_unique_id,
    //
    name: document.name,
    type: document.mime_type,
    //
    title      : title,
    description: description
  })
  //
  return record
}

m.update = async function (file, document=null, title=null, description=null) {
  if (document)
    file.set({
             id: document.file_id,
      unique_id: document.file_unique_id,
      //
      name: document.name,
      type: document.mime_type,
    })
  if (title)
    file.set({
      title: title
    })
  if (description)
    file.set({
      description: description
    })
}

m.delete = async function (file) {
  await m.table.delete(file.key)
}


m.token = async function (token) {
  let files = []
  //
  for (const fragment of await token.fragment('files').list())
    for (const [file, status] of Object.entries(fragment.props))
      if (status === m.fileExist)
        files.push(await m.get(file))
  //
  return files;
}

m.tokenToggle = async function (token, file) {
  const contain = await m.tokenContains(token, file)
  //
  await token.fragment('files').set({
    [file.key]: contain? m.fileNotExist : m.fileExist  // reverse file status
  })
  return !contain
}

m.tokenContains = async function (token, file) {
  for (const fragment of await token.fragment('files').get())
    if (fragment.props[file.key] === m.fileExist)
      return true
  return false
}


m.all = async function () {
  return Promise.all(
    (await m.table.list())
      .results
      .map(file => m.get(file.key))
  )
}
