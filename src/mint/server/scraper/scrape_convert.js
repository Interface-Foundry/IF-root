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


//come here and get localized
var getLocale = function * (url,user_country,user_locale,store_country,domain){
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
var scrapeURL = function * (url){
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
	yield request(options, function (error, res, html) {
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
var tryHtml = function * (s,$) {

	switch(s.domain.name){

		case 'store.punyus.jp':
			//get product id
			s.product_id = yield urlValue(s.original_link,'detail',1)
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
			s.product_id = yield urlValue(s.original_link,'detail',1)
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
			$('#size').find('dd').each(function(i, elm) {
				//did user select?
				var selected 
				if($(this).has('.current').attr('class')){
					selected = true
				}else {
					selected = false
				}
				s.options.push({
					type: 'size',
					original_name: {
						value: $(this).text().trim()
					},
					selected: selected,
					available: true
				})
			})

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
var foreignExchange = function * (s,base,target,value,spread){
	var rates = yield getRates()
	if(rates && target in rates){
  		fx.rates = rates
	    value = fx.convert(value, {from: base, to: target})
	    //add an average currency spread on top of the conversion (3% on top of the currency value)
	    //to account for fluctuations between adding to the cart and the checkout
	    var sp = 1.00 + spread
	    value = value * sp
	    s.price = value.toFixed(2) //idk if we are rounding up here?

	    s.original_price.fx_rate = rates
	    s.original_price.fx_rate_src = 'fixer.io'
	    s.original_price.fx_on =  new Date() //this might be different from current day, as markets closed on weekends
	    s.original_price.fx_spread = spread

	    return s
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
var translate = function * (text, target) {
  // Instantiates a client
  const translate = Translate()
  var translations
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  yield translate.translate(text, target)
    .then((results) => {
      translations = results[0]
      translations = Array.isArray(translations) ? translations : [translations];
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
    return translations
}


var urlValue = function * (url,find,pointer){
	//locate value in URL, pass URL to split and move up/down the array to find value
	//i.e. get number in: /detail/4549738521792 
	var split = url.split('/')
	split = split[split.indexOf(find) + pointer]
	split = split.split('?')
	return split[0]
}

var translateText = function * (s){

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
	//keep context of text mapping (need to double check the logic here....)
	var t = _.map(c, 'value')
	var tc = {translate:t,context:c}
	//send to google for translate
	var tc_map = yield translate(tc.translate,s.user.locale)

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
co(function *(){

	//incoming country / locale 
	var user_country = 'US'
	var user_locale = 'en'
	var store_country = 'JP'
	//var domain = 'muji.net'
	var domain = 'store.punyus.jp'
	//var url = 'https://www.muji.net/store/cmdty/detail/4549738522508'
	var url = 'https://store.punyus.jp/detail/PN17SS-193/'

	var s = yield getLocale(url,user_country,user_locale,store_country,domain) //get domain 
	var html = yield scrapeURL(url)
	var $ = cheerio.load(html)
	s = yield tryHtml(s,$)
 	s = yield foreignExchange(s,s.domain.currency,s.user.currency,s.original_price.value,0.03)
 	s = yield translateText(s)
 	

	console.log('res: ',s)

    //save RAW HTML here

 //    var raw = await db.RawHtml.create({
 //    	raw_html: html,
 //    	original_url: url
	// 	domain: domain
	// })

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
