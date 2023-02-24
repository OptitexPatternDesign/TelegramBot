const global = require("./global")


const add = exports.add = async function (file, title, description) {
  const record = await global.tables.files.set(file.file_unique_id, {
           id: file.file_id,
    unique_id: file.file_unique_id,
    //
    name: file.name,
    type: file.mime_type,
    //
    title      : title.text,
    description: description.text
  }, {})
  //
  return record
}

const all = exports.all = async function () {
  return (await global.tables.files.list()).results
}