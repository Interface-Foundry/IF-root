const logging = require('../../../logging.js')
const scrape = require('./scrape_convert')

//var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=303964888&infw_disp_no_sct_cd=20&infw_disp_no=5370476&allViewYn=N'
var uri = 'http://www.lotte.com/goods/viewGoodsDetail.lotte?goods_no=396484359&infw_disp_no_sct_cd=78&infw_disp_no=5505566&allViewYn=N'

//var uri = 'https://www.muji.net/store/cmdty/detail/4549738522508'
var domain = 'lotte.com'
//var domain = 'muji.net'
var story_country = 'KR'
//var story_country = 'JP'

var user_locale = 'en'
var user_country = 'US'

var start = async function () {
	var itemData = await scrape(uri, user_country, user_locale, story_country, domain)
	console.log(itemData)
}
start()

