const m = exports
//
const global = require("./../global")


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
  console.log(files)
  if (m.fileStatus(user, file)) {
    console.log("delete", file)
    await files.set({[file.key]: '-'})
    return false;
  } else {
    console.log("add", file)
    await files.set({[file.key]: '+'})
    return true
  }
}

m.status = async function (user, file) {
  for (const fragment of await user.fragment('files').get()) {
    console.log('props', fragment.props)
    if (fragment.props[file.key] && fragment.props[file.key] === '+')
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
