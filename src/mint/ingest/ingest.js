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
module.exports = function * (source, fieldsToChange, textIndex) {
  yield dbReady;
  yield db[`${source}InventoryItems`].destroy({})

  var data = yield fs.readFile(`./ingest/tsv/${source}.tsv`);
  var records = parse(data, {
    delimiter: '\t',
    relax: true,
    columns: (labels) => labels.map(label => {
      if (Object.keys(fieldsToChange).includes(label)) {
        return fieldsToChange[label]
      } else {
        return label.replace(' ', '_').toLowerCase()
      }
    }),
    auto_parse: true
  });


  console.log('creating inventory...')
  yield db[`${source}InventoryItems`].create(records);
  console.log('done with creating inventory')

  if (textIndex) {
    console.log('creating text indexes for mongodb...')
    var createIndexForArray = textIndex.reduce((prev, curr) => { prev[curr] = "text"; return prev}, {})

    var rawCollection = yield new Promise((resolve, reject) => {
      db[`${source}InventoryItems`].native((e, r) => e ? reject(e) : resolve(r))
    })

    yield rawCollection.createIndex(createIndexForArray)
  }
}

