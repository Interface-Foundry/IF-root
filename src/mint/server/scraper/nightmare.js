var co = require('co')
var Nightmare = require('nightmare')
var nightmare = Nightmare({show: true})
var Agent = require('socks5-https-client/lib/Agent')

/**
 * returns a fake user agent to be used in request headers.
 */
var fakeUserAgent = function () {
  var osxVer = Math.floor(Math.random() * 9) + 1;
  var webkitMajVer = randomInt(999) + 111;
  var webkitMinVer = randomInt(99) + 11;
  var chromeMajVer = randomInt(99) + 11;
  var chromeMinVer = randomInt(9999) + 1001;
  var safariMajVer = randomInt(999) + 111;
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+ osxVer +
  ') AppleWebKit/' + webkitMajVer + '.' + webkitMinVer +
  ' (KHTML, like Gecko) Chrome/' + chromeMajVer + '.0.' + chromeMinVer +
  '2623.110 Mobile Safari/' + safariMajVer +'.36';
}


// nightmare.goto('https://item.taobao.com/item.htm?spm=a219r.lmn002.14.350.70b3a555i5eHfT&id=554289270484&ns=1&abbucket=13&sku=1627207:117004077#detail')
module.exports = async function (uri) {
  console.log('scraping.... with *nightmare*')

  return await nightmare
    .goto(uri, {
		  'User-Agent': fakeUserAgent(),
		  'Accept': 'text/html,application/xhtml+xml',
		  'Accept-Language':'en-US,en;q=0.8',
		  'Cache-Control':'max-age=0',
		  'Connection':'keep-alive'
		})
    // .wait('#J_Promo')
    .evaluate(function () {
      return document.querySelector('body').innerHTML
    })
    .end()
    .then(function (res) {
      // console.log('result:', res)
      console.log('got response')
      return res
    })
}
