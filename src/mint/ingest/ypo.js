var ingest = require('./ingest');
var co = require('co');

co(function * () {
  yield ingest('Ypo', ['code', 'name', 'price', 'unit_type']);
});
