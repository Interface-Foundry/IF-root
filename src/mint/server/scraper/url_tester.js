const logging = require('../../../logging.js')
const scrape = require('./scrape_convert')
const fs = require('fs-extra')

//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370476&allViewYn=N'
//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396484359&infw_disp_no_sct_cd=78&infw_disp_no=5505566&allViewYn=N'

// var uri = 'https://www.muji.net/store/cmdty/detail/4549738459170'

// //var uri = 'https://www.muji.net/store/cmdty/detail/4549738522508'
// //var domain = 'lotte.com'
// var domain = 'muji.net'
// //var domain = 'store.punyus.jp'
// //var story_country = 'KR'
// var story_country = 'JP'


var user_locale = 'en'
var user_country = 'US'

function setVariables(uri) {
	if (uri.includes('muji')) {
		domain = 'muji.net'
		store_country = 'JP'
	}
	else if (uri.includes('punyus')) {
		domain = 'store.punyus.jp'
		store_country = 'JP'
	}
	else {
		domain = 'lotte.com'
		store_country = 'KR'
	}
}

function validate(itemData) {
	logging.info('itemData', itemData)
	var valid = true

	valid = valid && itemData.original_link
	valid = valid && itemData.original_name && itemData.original_name.value
	valid = valid && itemData.original_description && itemData.original_description.value
	valid = valid && itemData.original_price && itemData.original_price.value

	itemData.options.map(op => {
		valid = valid && op.name
	})

	valid = valid && itemData.product_id
	valid = valid && itemData.main_image_url
	valid = valid && itemData.price
	valid = valid && itemData.raw_html

	return valid
}

var start = async function () {
	// console.log(itemData)
	
	// var urls = await fs.readFile('./server/scraper/urls.txt', 'utf8')
	// urls = urls.split('\n')
	// logging.info('FILE', urls)

	var urls = [
	// 'https://www.muji.net/store/cmdty/detail/4549738478638?searchno=4'
	// https://www.muji.net/store/cmdty/detail/4549738496939?searchno=1
	// https://www.muji.net/store/cmdty/detail/4549738522508
	// http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370476&allViewYn=N
	// http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396484359&infw_disp_no_sct_cd=78&infw_disp_no=5505566&allViewYn=N
	// http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370475&allViewYn=N
	// https://store.punyus.jp/detail/PN17SS-008/
	// https://store.punyus.jp/detail/PN17SS-142/
	'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=379178639&infw_disp_no_sct_cd=20&infw_disp_no=5021982&allViewYn=N'
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=208463377&infw_disp_no_sct_cd=10&infw_disp_no=5406545&allViewYn=Y&tclick=SMALL_shop_19',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=387963014&infw_disp_no_sct_cd=10&infw_disp_no=0&conr_no=48861&tracking=BIGCT_1676186_DEALGOODS_01&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=353847429&infw_disp_no_sct_cd=10&infw_disp_no=5406545&allViewYn=Y&tclick=SMALL_shop_19',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396528273&infw_disp_no_sct_cd=20&infw_disp_no=5385125&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=269624429&infw_disp_no_sct_cd=20&infw_disp_no=5407940&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=392004200&infw_disp_no_sct_cd=20&infw_disp_no=5378431&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396604212&infw_disp_no_sct_cd=20&infw_disp_no=5411774&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=356181082&infw_disp_no_sct_cd=10&infw_disp_no=0&conr_no=48861&tracking=BIGCT_1481413_DEALGOODS_05&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=379178639&infw_disp_no_sct_cd=20&infw_disp_no=5021982&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=372961334&infw_disp_no_sct_cd=10&infw_disp_no=0&conr_no=48861&tracking=BIGCT_5211738_DEALGOODS_07&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=280220224&infw_disp_no_sct_cd=10&infw_disp_no=1670756&conr_no=48866&tracking=BIGCT_1670756_BESTBRAND01_G02&allViewYn=N',
	 // 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=260030354&infw_disp_no_sct_cd=20&infw_disp_no=5409481&allViewYn=N'
	]

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
