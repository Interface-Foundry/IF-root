var parse = require('csv-parse/lib/sync');
var fs = require('co-fs');
var series = require('co-series');
var co = require('co');
// var tsv = require('tsv').Parser

var db
const dbReady = require('../db')
dbReady.then((models) => { db = models; })


/**
 * @param source {string} - string representing the source of data
 * @param fields {array} - array of strings that are ordered to correspond
 * @param fields {array} - array of text indexes to do
 * to the columns in the tsv and fields in the db schema
 */
module.exports = function * (source, fields, textIndex) {
  yield dbReady;
  yield db[`${source}InventoryItems`].destroy({})

  var data = yield fs.readFile(`./ingest/tsv/${source}.tsv`);
  var records = parse(data, {
    delimiter: '\t',
    relax: true,
    columns: true,
    auto_parse: true
  });

  console.log('creating inventory...')
  yield db[`${source}InventoryItems`].create(records);
  console.log('done with creating inventory')

  if (textIndex) {
    console.log('creating text indexes for mongodb...')
    var createIndexForArray = textIndex.reduce((prev, curr) => { prev[curr] = "text"; return prev}, {})
    console.log('INNDND', createIndexForArray)
    yield new Promise((resolve, reject) => {
      db[`${source}InventoryItems`].native((err, collection) => {
        if (err) reject(err)
        else {
          resolve(collection.createIndex(createIndexForArray))
        }
      })
    })
  }

}

