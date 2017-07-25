var cheerio = require('cheerio')
var _ = require('lodash')
var url = require('url')
var lotte = require('./stores/lotte')
var punyus = require('./stores/punyus')
var muji = require('./stores/muji')
var waitrose = require('./stores/waitrose')
var hands = require('./stores/hands')

//scraper stuff
var fx_currency = require('./foreign_exchange')
var utils = require('./scrape_utils')

//try to get data from html
module.exports.tryHtml = async function (s,html) {

	var $ = await cheerio.load(html)

	if(!s){
		logging.error('nothing in scrape object!')
		return
	}

	switch(s.domain.name){

		case 'lotte.com':
			return await lotte(s, $, processChildOptions, html)
			break

		case 'store.punyus.jp':
			return await punyus(s, $)
			break

		case 'muji.net':
			return await muji(s, $)
			break

		case 'waitrose.com':
			return await waitrose(s, $)
			break

		case 'hands.net':
			return await hands(s, $)
			break

		default:
			return logging.error('error no domain found for store')
	}
}

//some sites require us to process child option data
var processChildOptions = async function(s,parentOption,html,rates){

	var $ = await cheerio.load(html)

	switch(s.domain.name){
		case 'lotte.com':

			//convert parent option prices
			if(parentOption.original_price && parentOption.original_price.value){
				var price = await fx_currency.foreignExchange(s.domain.currency,s.user.currency,parentOption.original_price.value,rates)
 				parentOption = await fx_currency.storeFx(rates[s.user.currency],price,parentOption)
			}

			var options = []

			//push parent style options
			options.push(parentOption)

			//parent option doesnt have any sub options
			if($('.c_list li').length <= 0){
				return options
			}

			//get options
			$('.c_list li').each(function(i, elm) {

				options.push({
					type: 'size', //size = child level option
					original_name: {
						value: $('.sec01',this).text().trim()
					},
				    //product_id: product_id, //product ID of the size
				    parent_id: parentOption.product_id, //product ID of the style

				    //checking available if this option has an a link
				    //---> (can't click option if it's unavail)
				    available: ( $('a',this).attr('goodsno') ) ? true : false
				})
			})

			return options
		break
	}
}
