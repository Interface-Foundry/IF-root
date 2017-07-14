var request = require('request-promise')

//encoding stuff
var charset = require('charset'),
    jschardet = require('jschardet'),
    Iconv = require('iconv').Iconv


//scrapes URL and convets to UTF-8 if it isn't already
module.exports.scrapeURL = async function (url) {
	var options = {
		url: url,
		encoding: null,
		// proxy: proxyUrl,
		headers: {
		  'User-Agent': fakeUserAgent(),
		  'Accept': 'text/html,application/xhtml+xml',
		  'Accept-Language':'en-US,en;q=0.8',
		  'Cache-Control':'max-age=0',
		  'Connection':'keep-alive'
		},
		// timeout: timeoutMs,
	}
	var convert
	await request(options, function (error, res, html) {
	  if (!error && res.statusCode == 200) {

	  	//detect char encoding
	  	var enc = charset(res.headers, html) || jschardet.detect(html).encoding.toLowerCase()
	   	//setup encoding
	    var iconv = new Iconv(enc, 'UTF-8//TRANSLIT//IGNORE')
	    //do convert
   		convert = iconv.convert(new Buffer(html)).toString('utf8')

	  }else {
	  	logging.error('ERROR '+response.statusCode+' IN REQUEST!!!!! ', error)
	  }
	})
	return convert
}

//locate value in URL, pass URL to split and move up/down the array to find value
//i.e. get number in: /detail/4549738521792
module.exports.urlValue = async function (url,find,pointer){
	var split = url.split('/')
	split = split[split.indexOf(find) + pointer]
	split = split.split('?')
	return split[0]
}

//true or false if input time is greater than an hour ago
//(can someone double check my time logic here thx)
module.exports.is_older_than_1hour = async function (datetime) {
	var before = new Date(datetime),
		now = new Date()
	return ( ( now - before ) > ( 60 * 60 * 1000 )  ) ? true : false
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
  '2623.110 Safari/' + safariMajVer +'.36';
}

/**
 * returns a random integer between 0 and the specified exclusive maximum.
 */
function randomInt(exclusiveMax) {
  return Math.floor(Math.random() * Math.floor(exclusiveMax))
}

