var cheerio = require('cheerio')
var co = require('co')
var fs = require('fs')
var _ = require('lodash')
var request = require('request-promise')
var fx = require("money")
const Translate = require('@google-cloud/translate')

var url = 'https://www.muji.net/store/cmdty/detail/4549738522508'
var dailyRates



//ACCEPT THIS INPUT:
// user_country: 'string', //US (i'll pass it back..?)
// user_locale:'string', //en-us && $0.00 



/**
 * Scrapes a link
 * @returns full site HTML
 * @param the mongoId (as a string) of the last camel item we've shown the user
 */
// var scrape = function * (url) {
//     yield var res = getHTML(url);
//     return res.then(body => {
//         // console.log('success', body);
//         console.log('success');
//         return body;
//       }).catch(err => {
//         console.log('bad', err);
//       });
// }

var options = {
	url: url,
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

function scrapeURL(){
	request(options, function (error, response, html) {
	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html)


		// //do a thing
		// co(function *(){
		// 	var price = yield foreignExchange('USD','KRW',1,0.03)
		// 	console.log('price ',price)
		// }).catch(onerror)

		var ogImage
		var keywords
		var description
		var price

		//co routine
	    getMeta()
	    getItem()

	    function getMeta(){
		 	var meta = $('meta')
			var keys = Object.keys(meta)

			//abstracted function, get properties from page
			//return as much as possible to fill defined schema
			//RETURN THE NON TRANSLATED STUFF TOO, so user can view both
			//these filled up suggestion will pre-populate the add item input form



			keys.forEach(function(key){
			if (meta[key].attribs && meta[key].attribs.property) {
				if(meta[key].attribs.property === 'og:image'){
					ogImage = meta[key].attribs.content
				} 
			}
			});

			keys.forEach(function(key){
				if (meta[key].attribs && meta[key].attribs.name) {
				   	if (meta[key].attribs.name === 'keywords'){
				   		keywords = meta[key].attribs.content
				   	}else if (meta[key].attribs.name === 'description') {
				   		description = meta[key].attribs.content
				   	}
				}
			});
			console.log('image ',ogImage)
			console.log('keywords ',keywords)
			console.log('description ',description)   	
	    }


	    function getItem(){

			$('.productName').each(function(i, elm) {
			    console.log('product name: ',$(this).text().trim()) // for testing do text() 
			})

			$('.desc').each(function(i, elm) {
			    console.log('DESCRIPTION ',$(this).text().trim()) // for testing do text() 
			})

			$('.price').each(function(i, elm) {
				if ($(this).text()){
					console.log('PRICE ',$(this).text().trim()) // for testing do text() 
				}
			})

			$('#size').find('dd').each(function(i, elm) {
				console.log('SIZE: ',$(this).text().trim())
			})

			$('#color').find('dd').each(function(i, elm) {
				console.log('COLOR: ',$(this).text().trim())
			})


			var price = yield foreignExchange('USD','KRW',1,0.03)
			console.log('price ',price)
			var translated = translateText('hello how are you','fr')



			// $('#size').each(function(i, elm) {
			// 	console.log(i)
			//    // console.log('SIZES ',$(this).text()) // for testing do text() 

			//     //class = available
			//     // class = current (check if nested inside)
			// })

			// $('dl #color').each(function(i, elm) {
			//     console.log('COLORS ',$(this).text()) // for testing do text() 
			// })

	    }


	  }else {
	  	console.log('ERROR '+response.statusCode+' IN REQUEST!!!!! ', error)
	  }
	})	
}


/**
 * Converts money value between currencies and adds spread percentage (i.e. KRW to USD)
 * @param {string} Base currency to convert FROM (i.e. KRW)
 * @param {string} Currency to convert TO (i.e. USD)
 * @param {number} The currency value to convert
 * @param {number} The spread percent to include on top
 * @returns {number} The new price converted to the requested currency
 */
var foreignExchange = function * (base,target,value,spread){
	var rates = yield getRates()
	if(rates && target in rates){
  		fx.rates = rates
	    value = fx.convert(value, {from: base, to: target})
	    //add an average currency spread on top of the conversion (3% on top of the currency value)
	    //to account for fluctuations between adding to the cart and the checkout
	    var s = 1.00 + spread
	    value = value * s
	    return value.toFixed(2) //idk if we are rounding up here?
  	}
  	else {
  		console.log('conversion not found or something')
  	}
}

/**
 * Gets latest fx market rates 
 * @returns {object} A list of currencies with corresponding rates
 */
var getRates = function * (){

	//NEED TO FETCH NEW RATES DAILY 

	//get conversion rates (updated daily). fixer.io is accurate-ish but not super accurate based on time of day, static on weekends, as it coincides when markets are open. 
	//but a pretty good free service, backed by trusted, public data generated by an EU org.
	var rateReq = yield request('http://api.fixer.io/latest', function (error, response, data) {
	  if (!error && response.statusCode == 200) {
	  	return data
	  }	
	  else {
	  	console.log('ERROR '+response.statusCode+' IN CURRENCY EXCHANGE REQUEST! ', error)
	  }
	})
	return JSON.parse(rateReq).rates
}

/**
 * Translates one or more sentence strings into target language
 * @param {string} Text (string or array of strings) to translate
 * @param {string} Target language
 * @returns {object} A list of currencies with corresponding rates
 */
function translateText (text, target) {
  // Instantiates a client
  const translate = Translate()

  // The text to translate, e.g. "Hello, world!"
  // const text = 'Hello, world!';

  // The target language, e.g. "ru"
  // const target = 'ru';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  translate.translate(text, target)
    .then((results) => {
      let translations = results[0];
      translations = Array.isArray(translations) ? translations : [translations];

      console.log('Translations:');
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
      });
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END translate_translate_text]
}


//do a thing
co(function *(){
	getRates()
	var data = yield scrapeURL()
}).catch(onerror)


/**
 * returns a random integer between 0 and the specified exclusive maximum.
 */
function randomInt(exclusiveMax) {
  return Math.floor(Math.random() * Math.floor(exclusiveMax))
}

/**
 * returns a fake user agent to be used in request headers.
 */
function fakeUserAgent() {
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

//error handle
function onerror(err) {
  console.error(err.stack);
}
