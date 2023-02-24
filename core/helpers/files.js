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

const all = exports.all = async function () {
  const all = []
  for (const file of (await global.tables.files.list()).results)
    all.push(global.tables.files.item(file.key))
  //
  return all
}