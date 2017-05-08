var parse = require('csv-parse/lib/sync');
var co = require('co');
var fs = require('co-fs');

co(function * () {
  var data = yield fs.readFile('./YPO-2017-CSV.CSV');
  var records = parse(data);
  console.log('records', records);
})
