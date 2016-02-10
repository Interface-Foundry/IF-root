'use strict';
var sqlite = require('sqlite3')
var db = new sqlite.Database('kiptest-amazon.db')
var kip = require('kip')
var fs = require('fs')

db.all('select * from product_tbl;', (e, products) => {
  kip.fatal(e);
  console.log(products.length)
  var asins = products.map((p) => {
    return p.asin;
  }).join('\n')
  fs.writeFileSync('./asins.bestsellers.txt', asins)
  process.exit(0);
})
