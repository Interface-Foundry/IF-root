const logging = require('../../../logging.js')
const scrape = require('./scrape_convert')
const fs = require('fs-extra')

//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370476&allViewYn=N'
//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396484359&infw_disp_no_sct_cd=78&infw_disp_no=5505566&allViewYn=N'

//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370475&allViewYn=N'
// var uri = 'https://www.muji.net/store/cmdty/detail/4549738496939?searchno=1'
// var uri = 'https://www.muji.net/store/cmdty/detail/4549738522508'
//var domain = 'lotte.com'
// var domain = 'muji.net'
//var story_country = 'KR'd
var store_country = 'JP'
var domain;

var user_locale = 'en'
var user_country = 'US'

function setVariables(uri) {
	if (uri.includes('muji')) {
		domain = 'muji.net'
	}
	else if (uri.includes('punyus')) {
		domain = 'store.punyus.jp'
	}
	else {
		domain = 'lotte.com'
		store_country = 'KR'
	}
}

function validate(itemData) {
	logging.info('itemData', itemData)
	var valid = true

	valid = valid && !!itemData.original_link
	valid = valid && !!itemData.original_name && !!itemData.original_name.value
	console.log('original_name', JSON.stringify(valid))

	valid = valid && !!itemData.original_price && !!itemData.original_price.value
	console.log('original_price', valid)

	itemData.options.map(op => {
		valid = valid && !!op.name
	})
	console.log('item options', JSON.stringify(valid))

	valid = valid && !!itemData.product_id
	valid = valid && !!itemData.main_image_url
	console.log('main_image_url', JSON.stringify(valid))

	valid = valid && !!itemData.price
	valid = valid && !!itemData.raw_html

	return valid
}

var start = async function () {
	// console.log(itemData)
	var urls = await fs.readFile('./server/scraper/urls.txt', 'utf8')
	urls = urls.split('\n')
	logging.info('FILE', urls)

	for (var i = 0; i < urls.length; i++) {
		var uri = urls[i]
		if (uri) {
			setVariables(uri)
			var itemData = await scrape(uri, user_country, user_locale, store_country, domain)
			var valid = validate(itemData);
			if (valid) console.log('successfully scraped ' + domain)
			else console.log('failed to scrape ' + domain)
		}
	}
}
start()
