const m = exports
//
const global = require("./../global")


m.fileExist    = '+'
m.fileNotExist = '-'

m.add = async function (document, title, description) {
  const record = await global.tables.files.set(document.document.file_unique_id, {
           id: document.document.file_id,
    unique_id: document.document.file_unique_id,
    //
    name: document.document.name,
    type: document.document.mime_type,
    //
    title      : title.text,
    description: description.text
  })
  //
  return record
}

m.update = async function (file, document=null, title=null, description=null) {
  console.log(file, document, title, description)
  if (document)
    file.set({
             id: document.document.file_id,
      unique_id: document.document.file_unique_id,
      //
      name: document.document.name,
      type: document.document.mime_type,
    })
  if (title)
    file.set({
      title: title.text
    })
  if (description)
    file.set({
      description: description.text
    })
}

m.delete = async function (file) {
  await global.tables.files.delete(file.key)
}


m.user = async function (user) {
  let files = []
  //
  for (const fragment of await user.fragment('files').list())
    for (const [file, status] of Object.entries(fragment.props))
      if (status === m.fileExist)
        files.push(await global.tables.files.get(file))
  //
  return files;
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
