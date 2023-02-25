const global = require("./../global")


const m = exports

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

m.all = async function () {
  return Promise.all(
    (await global.tables.files.list())
      .results
      .map(file => global.tables.files.get(file.key))
  )
}
