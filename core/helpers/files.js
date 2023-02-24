const global = require("./../global")


const add = exports.add = async function (file, title, description) {
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
  console.log("added", record)
  //
  return record
}

const keys = exports.keys = async function () {
  return (await global.tables.files.list()).results
    .map(file => file.key)
}

const get = exports.get = function (key) {
  return global.tables.files.get(key)
}