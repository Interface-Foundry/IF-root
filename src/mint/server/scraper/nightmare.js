var co = require('co')
var Agent = require('socks5-https-client/lib/Agent')
var Nightmare = require('nightmare')
// var proxynightmare = Nightmare({
//   show: true,
//   gotoTimeout: 10000,
//   switches: {
//     'proxy-server': 'socks5://109.201.154.239:1080',
//     'ignore-certificate-errors': false
//   }
// })
var nightmare = Nightmare({show: true})

/**
 * returns a random integer between 0 and the specified exclusive maximum.
 */
function randomInt(exclusiveMax) {
  return Math.floor(Math.random() * Math.floor(exclusiveMax))
}

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
module.exports = async function (uri, proxy) {
  console.log('scraping.... with *nightmare*')
  // if (proxy || true) {
  //   console.log('let\'s use a proxy')
  //   var n = proxynightmare
  // }
  // else var n = nightmare

  try {
    return await nightmare
      .goto(uri, {
  		  // 'UserAgent': fakeUserAgent(),
  		  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
  		  'Accept-Language':'en-US,en;q=0.8',
  		  'Cache-Control':'max-age=0',
  		  'Connection':'keep-alive',
        'Cookie': 'thw=cn; t=951d4b470afbae0a33d3fa4a81238ce8; cookie2=3c4ab744fc2d0f42a082ae537c12e330; v=0; linezing_session=hEZO8PpaAtGHW1vCfORKttLK_1501773405797TXCi_1; _m_h5_tk=edc429663c52d293bfbddd2169ffb3c2_1501780948742; _m_h5_tk_enc=44055e33675a37f2d7d7bc7da69f751f; miid=1744327738693929296; hng=CN%7Czh-cn%7CCNY; cna=vxfsEX5MHAICAUUMGzI8qqtS; _tb_token_=3dfbeeee8a431; mt=ci%3D-1_0; uc1=cookie14=UoTcDv7dsENytA%3D%3D; isg=Ajw8S7sBSUvWs3327xIh5uH6DdPkGOpZgvXwsBa9SCcK4dxrPkWw77LT7T9i',
        'dnt': 1,
        'upgrade-insecure-requests': 1,
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36'
      })
      // .authentication('x7229287', 'QbhYhHsKZG')
      // .goto(uri)
      // .cookies.clear('_med')
      // .cookies.clear('hng')
      // .cookies.set({
      //   name: 'thw',
      //   value: 'cn',
      //   domain: '.taobao.com',
      //   path: '/'
      // })
      // .cookies.set({
      //   name: 'hng',
      //   value: 'CN%7Czh-CN%7CCNY%7C156',
      //   domain: '.taobao.com',
      //   path: '/',
      //   session: true
      // })
      .goto(uri)
      // .goto(uri.slice(0, 8) + 'item' + uri.slice(12))

      // .cookies.get()
      // .then(function(cookies) {
      //   console.log('cookies', cookies)
      // })
      // console.log('about to evaluate the url')

      .evaluate(function () {
        return document.querySelector('body').innerHTML
      })
      .end()
      .then(function (res) {
        // console.log('result:', res)
        console.log('got response', !!res)
        return res
      })
  }
  catch (err) {
    console.log('error:', err)
  }

  }
