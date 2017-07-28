var co = require('co')
var Nightmare = require('nightmare')
var nightmare = Nightmare({show: true})

// nightmare.goto('https://item.taobao.com/item.htm?spm=a219r.lmn002.14.350.70b3a555i5eHfT&id=554289270484&ns=1&abbucket=13&sku=1627207:117004077#detail')
module.exports = function * (uri) {
  var html_id = Math.random() * 10 * 6
  var result = yield nightmare
    .goto(uri)
    .html(`./html/nightmare_${html_id}.html`)
  yield nightmare.end()

  console.log('result:', result)
  return html_id
}
