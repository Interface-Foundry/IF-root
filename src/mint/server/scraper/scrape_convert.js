var co = require('co')
var fs = require('fs')
var currency = require('currency-code-map')

var db
const dbReady = require('../../db')

dbReady.then((models) => { db = models; })

//scraper stuff
var utils = require('./scrape_utils')
var handle_html = require('./handle_html')
var fx_currency = require('./foreign_exchange')
var translate = require('./text_translation')

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

	return s
}



//do a thing
var scrape = async function (url, user_country, user_locale, store_country, domain) {
		//incoming country / locale
		console.log('USER_COUNTRY, USER_LOCALE', user_country, user_locale)
		var s = getLocale(url,user_country,user_locale,store_country,domain) 
		var html = await utils.scrapeURL(url)
		s = await handle_html.tryHtml(s,html)

		if(!s){
			return logging.error('no s object found!')
		}

		var rates = await fx_currency.getRates()
 		var price = await fx_currency.foreignExchange(s.domain.currency,s.user.currency,s.original_price.value,rates)
 		s = await fx_currency.storeFx(rates[s.user.currency],price,s)

		s = await translate.translateText(s)

    	//save RAW HTML here
 	  	var raw = await db.RawHtml.create({
 	    raw_html: String(html),
 	   		original_url: url,
		 	domain: domain
		})
		logging.info('saved raw html')
		s.raw_html = raw.id

		return s
}

module.exports = scrape