var sql = require('sqlite3')
var path = require('path')
var db = new sql.Database(path.resolve(__dirname, 'training_data.db'));

db.serialize(function() {
  db.run(`create table if not exists product_tbl (
    asin text not null primary key,
    price text,
    text text,
    full_html text
  )`)

  db.run(`create table if not exists qa_tbl (
    asin text,
    question text,
    answer text
  )`)

  db.insert_product = db.prepare(`insert or replace into product_tbl (asin, price, text, full_html) values (
    $asin,
    coalesce($price, (select price from product_tbl where asin = $asin)),
    coalesce($text, (select price from product_tbl where asin = $asin)),
    coalesce($full_html, (select price from product_tbl where asin = $asin))
  )`)

  db.insert_qa = db.prepare(`insert into qa_tbl (asin, question, answer) values ($asin, $q, $a)`)

})

module.exports = {
  insertProduct(product) {
    db.insert_product.run($(product))
  },
  insertQA(qa) {
    db.insert_qa.run($(qa))
  }
}

// dollar-sign-ify all the props
function $(o) {
  return Object.keys(o).reduce(function($o, k) {
    $o['$' + k] = o[k];
    return $o;
  }, {})
}
