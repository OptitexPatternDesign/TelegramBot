// example.js
const CyclicDB = require('@cyclic.sh/dynamodb')
const db = CyclicDB('asdf')

const run = async function(){
    let animals = db.collection('animals')

    // create an item in collection with key "leo"
    let leo = await animals.set('leo', {
        type:'cat',
        color:'orange'
    })

    // get an item at key "leo" from collection animals
    let item = await animals.get('leo')
    console.log(item)
}
run()