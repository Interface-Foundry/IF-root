const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mint';

const connection = new Promise((resolve, reject) => {
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    if (err) return reject(err)
    resolve(db)
  });
})

/**
 * Archive / delete / cold storage / whataver a thing.
 * Usage: var cart = yield db.Carts.findOne({}) .... yield cart.archive()
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
module.exports = async function () {
  var model = this
  const objToInsert = await model.toObject()
  const db = await connection
  await db.collection('cold_storage').insertOne(objToInsert)
  await model.destroy()
}
