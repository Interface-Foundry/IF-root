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
 * to the columns in the tsv and fields in the db schema
 */
module.exports = function * (source, fields) {
  yield dbReady;
  var data = yield fs.readFile(`./tsv/${source}.tsv`);
  var records = parse(data, {delimiter: '\t', relax: true});

  var categories = {}
  // console.log(records);
  yield records.map(series(function * (record) {
    var options = {};
    var invItem = yield db[`${source}InventoryItems`].create({});
    for (var i = 0; i < fields.length; i++) {
      invItem[fields[i]] = record[i];
    }
    yield invItem.save();
    // console.log('INVITEM', invItem);
  }));
  console.log('done ingesting tsv')
}
