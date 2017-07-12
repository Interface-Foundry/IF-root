var cheerio = require('cheerio')
var co = require('co')
var fs = require('fs')
var _ = require('lodash')
var request = require('request-promise')
var fx = require("money")
const Translate = require('@google-cloud/translate')
var currency = require('currency-code-map')

//encoding stuff
var charset = require('charset'),
    jschardet = require('jschardet'),
    Iconv = require('iconv').Iconv

var db
const dbReady = require('../../db')

dbReady.then((models) => { db = models; })

let fxRates //daily rates storage
const currencySpread = 0.03 //what's our currency spread

//come here and get localized
var getLocale = function (url,user_country,user_locale,store_country,domain){
	var s = {
		original_link: url,
		domain: {
			country: store_country,
			currency: currency[store_country],
			name: domain
		},
		user: {
			country: user_country,
			locale: user_locale,
			currency: currency[user_country]
		},
		original_name:{

		},
		original_description:{

		},
		original_price:{

		},
		options:[]
	}

	switch(store_country){
		case 'JP':
			s.domain.locale = 'ja'
			break
		case 'KR':
			s.domain.locale = 'ko'
			break
		default:
			s.domain.locale = store_country
	}

	switch(domain){
		case 'muji.net':
			s.domain.thumbnail_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/MUJI_logo.svg/176px-MUJI_logo.svg.png'
			s.domain.main_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/MUJI_logo.svg/176px-MUJI_logo.svg.png'
			s.domain.description = 'Muji Japan'
			break
	}
	return s
}

//scrapes URL and convets to UTF-8 if it isn't already
var scrapeURL = async function (url) {
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

	  	//if not utf-8
	    if(enc !== 'utf8') {
	    	//setup encoding
	        var iconv = new Iconv(enc, 'UTF-8//TRANSLIT//IGNORE')
	        //do convert
   			convert = iconv.convert(new Buffer(html)).toString('utf8')
	    }else {
	    	convert = html
	    }
	  }else {
	  	console.log('ERROR '+response.statusCode+' IN REQUEST!!!!! ', error)
	  }

	})
	return convert
}

//try to get data from html
var tryHtml = async function (s,$) {
	switch(s.domain.name){

		case 'lotte.com':



			break

		case 'store.punyus.jp':
			//get product id
			s.product_id = await urlValue(s.original_link,'detail',1)
			s.parent_id = s.product_id

			//get meta tags
		 	var meta = $('meta')
			var keys = Object.keys(meta)

			//get images
			keys.forEach(function(key){
				if (meta[key].attribs && meta[key].attribs.property) {
					if(meta[key].attribs.property === 'og:image'){
						//ogImage = meta[key].attribs.content
						s.thumbnail_url = meta[key].attribs.content
						s.main_image_url = meta[key].attribs.content
					}
				}
			})

			s.original_name.value = $('.itemInfo').find('[itemprop=name]').text().trim()
			s.original_description.value = $('.itemInfo').find('[itemprop=description]').text().trim()

			var p = $('.price').text().trim().replace(/[^0-9.]/g, "")
			s.original_price.value = parseFloat(p)

			$('.sku_colorList').each(function(i, elm) {

				var available
				if($(this).hasClass('nonstock')){
					available = false
				}else {
					available = true
				}

				s.options.push({
					type: 'color',
					original_name: {
						value: $('.sku_title',this).text().trim()
					},
				    thumbnail_url:$('img',this).attr('src'),
				    main_image_url:$('img',this).attr('src'),
				    option_id: i, //to keep track of parent options
					available: true,
					selected: false
				})

				//get sizes inside color options
				$('.axis_item',this).each(function(z, elm) {

					var available
					if($(this).hasClass('nonstock')){
						available = false
					}else {
						available = true
					}

					s.options.push({
						type: 'size',
						original_name: {
							value: $(this).text().trim().split('/')[0].trim()
						},
						parent_id: i, //to keep track of parent option
						available: available,
						selected: false
					})
				})
			})

			return s

		break

		case 'muji.net':

			//get product id
			s.product_id = urlValue(s.original_link,'detail',1)
			s.parent_id = s.product_id //use the same as product id for muji

			//get meta tags
		 	var meta = $('meta')
			var keys = Object.keys(meta)

			//get images
			keys.forEach(function(key){
				if (meta[key].attribs && meta[key].attribs.property) {
					if(meta[key].attribs.property === 'og:image'){
						//ogImage = meta[key].attribs.content
						s.thumbnail_url = meta[key].attribs.content
						s.main_image_url = meta[key].attribs.content
					}
				}
			})

			//get name and description from meta tags
			keys.forEach(function(key){
				if (meta[key].attribs && meta[key].attribs.name) {
				   	if (meta[key].attribs.name === 'keywords'){
				   		s.original_name.value = meta[key].attribs.content
				   	}else if (meta[key].attribs.name === 'description') {
				   		s.original_description.value = meta[key].attribs.content
				   	}
				}
			})

			//get price
			$('.price').each(function(i, elm) {
				if ($(this).text()){
					var p = $(this).text().trim().replace(/[^0-9.]/g, "") //locate price, remove other text
					s.original_price.value = parseFloat(p)
					return false
				}
			})

			//CHECK FOR SIZES
      console.log('SIZE STUFF')
			$('#size').find('dd').each(function(i, elm) {
				//did user select?
        // console.log('text:', $(this).text().trim())
				var selected
				if($(this).has('.current').attr('class')){
					selected = true
				}else {
					selected = false
				}
        //regex out non latin & numeric characters
        var sizeText = $(this).text().trim()//.replace(/[^0-9a-z]/gi, "")
        console.log('sizeText', sizeText)
        sizeText = sizeText.split('').map(c => c.charCodeAt())
        sizeText = sizeText.filter(function (code) {
          return (code >= 48 && code <= 57) || (code >= 65313 && code <= 65370)
          // digits, and full-width latin characters
        })
        sizeText = sizeText.map(code => String.fromCharCode(code))
        sizeText = sizeText.join('')
        console.log('sizeText', sizeText)

				s.options.push({
					type: 'size',
					original_name: {
						value: sizeText
					},
					selected: selected,
					available: true
				})
			})
      console.log('done w sizes')
      logging.info('s.options', s.options) //no "the"

			//CHECK FOR COLORS
			$('#color').find('dd').each(function(i, elm) {
				//did user select?
				var selected
				if($(this).has('.current').attr('class')){
					selected = true
				}else {
					selected = false
				}

				//item not available
				var available
				if($(this).attr('class') == 'out'){
					available = false
				}else {
					available = true
				}

				s.options.push({
					type: 'color',
					original_name: {
						value: $('img',this).attr('title') //get value inside img title in this
					},
					thumbnail_url: $('img',this).attr('src'),
					main_image_url: $('img',this).attr('src'),
					selected: selected,
					available: available
				})
			})
      logging.info('BOUT TO RETURN S', s.options)
			return s
		break
		default:
			console.log('error no domain found for store')
	}
}


/**
 * Converts money value between currencies and adds spread percentage (i.e. KRW to USD)
 * @param {string} Base currency to convert FROM (i.e. KRW)
 * @param {string} Currency to convert TO (i.e. USD)
 * @param {number} The currency value to convert
 * @param {number} The spread percent to include on top
 * @returns {number} The new price converted to the requested currency
 */
var foreignExchange = async function (base,target,value,spread,rates){
	if(rates && target in rates){
  		fx.rates = rates
	    value = fx.convert(value, {from: base, to: target})
	    //add an average currency spread on top of the conversion (3% on top of the currency value)
	    //to account for fluctuations between adding to the cart and the checkout
	    var sp = 1.00 + spread
	    value = value * sp

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
var getRates = async function (){

	//are the rates older than an hour? if so, get new ones
	if (fxRates && fxRates.rates && fxRates.fetchDate && !is_older_than_1hour(fxRates.fetchDate)){
		return fxRates.rates
	}

	//get conversion rates (updated daily). fixer.io is accurate-ish but not super accurate based on time of day, static on weekends, as it coincides when markets are open.
	//but a pretty good free service, backed by trusted, public data generated by an EU org.
	await request('http://api.fixer.io/latest', function (error, response, data) {
	  if (!error && response.statusCode == 200) {
	  	fxRates = JSON.parse(data)
	  	fxRates.fetchDate = new Date().toString()
	  }
	  else {
	  	console.log('ERROR '+response.statusCode+' IN CURRENCY EXCHANGE REQUEST! ', error)
	  }
	  return
	})

	return fxRates.rates
}

//true or false if input time is greater than an hour ago
//(can someone double check my time logic here thx)
function is_older_than_1hour(datetime) {
	var before = new Date(datetime),
		now = new Date()
	return ( ( now - before ) > ( 60 * 60 * 1000 )  ) ? true : false
}


/**
 * Translates one or more sentence strings into target language
 * @param {string} Text (string or array of strings) to translate
 * @param {string} Target language
 * @returns {object} A list of currencies with corresponding rates
 */
var translate = async function (text, target) {
  // Instantiates a client
	// return [text]
	console.log('translate called')
  const translate = Translate()
  var translations
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // // multiple texts.
	// console.log('text, target', text, target)
  return translate.translate(text, target)
	// console.log('got results:', results)
    .then((results) => {
      translations = results[0]
      translations = Array.isArray(translations) ? translations : [translations];
			return translations
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
    // return translations
}


var urlValue = function (url,find,pointer){
	//locate value in URL, pass URL to split and move up/down the array to find value
	//i.e. get number in: /detail/4549738521792
	var split = url.split('/')
	split = split[split.indexOf(find) + pointer]
	split = split.split('?')
	return split[0]
}

var translateText = async function (s){
	var c = []

	//collect text to translate into a single arr for google translate API
	if(s.original_name.value){
		c.push({
			type:'name',
			value: s.original_name.value
		})
	}
	if(s.original_description.value){
		c.push({
			type:'description',
			value: s.original_description.value
		})
	}
	if(s.options && s.options.length > 0){
		s.options.forEach(function(o){
			if(o.original_name){ //we AREN'T translating size options, it breaks translations
				c.push({
					type:'option',
					value: o.original_name.value
				})
			}
			else {
				console.log('no name found for option!')
			}
	    })
	}
	console.log('about to do the actual translation')
	//keep context of text mapping (need to double check the logic here....)
	var t = _.map(c, 'value')
	var tc = {translate:t,context:c}
	//send to google for translate
	var tc_map = await translate(tc.translate,s.user.locale)

	//piece translations back into the original obj
	for (var i = 0; i < tc.context.length; i++) {
		if(tc.context[i].type == 'name'){
			s.name = tc_map[i]
		}else if(tc.context[i].type == 'description'){
			s.description = tc_map[i]
		}else if(tc.context[i].type == 'option'){
			for (var z = 0; z < tc.context.length - i; z++) {
				s.options[z].name = tc_map[z + i]
			}
			break
		}
	}
	return s
}

//do a thing
var scrape = async function (url, user_country, user_locale, store_country, domain) {
		//incoming country / locale
		console.log('USER_COUNTRY, USER_LOCALE', user_country, user_locale)
		var s = getLocale(url,user_country,user_locale,store_country,domain) //get domain
		var html = await scrapeURL(url)
		var $ = cheerio.load(html)
		s = await tryHtml(s,$)

		var rates = await getRates()
 		var price = await foreignExchange(s.domain.currency,s.user.currency,s.original_price.value,currencySpread,rates)
 		s = await storeFx(rates,price,s)

		s = await translateText(s)

    //save RAW HTML here
 	  var raw = await db.RawHtml.create({
 	   raw_html: String(html),
 	   original_url: url,
		 domain: domain
		})
		console.log('saved raw html')
		s.raw_html = raw.id

		return s
}
	// }).catch(onerror)
// }

var storeFx = async function(rates,price,s){
	s.original_price.fx_rate = rates
    s.original_price.fx_rate_src = 'fixer.io'
    s.original_price.fx_on =  new Date()
    s.original_price.fx_spread = currencySpread
	s.price = price
	return s
}

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

module.exports = scrape;
