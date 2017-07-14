var cheerio = require('cheerio')
var _ = require('lodash')
var url = require('url')

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

			//get product id
			var parsed = url.parse(s.original_link, true)
			if(parsed.query && parsed.query.goods_no){
				s.product_id = parsed.query.goods_no
				s.parent_id = parsed.query.goods_no
			}
			
			//name
			if($('.group_tit').text().trim()){
				s.original_name.value = $('.group_tit').text().trim()
			}else if($('.pname').text().trim()){
				s.original_name.value = $('.pname').text().trim()
			}
			
			//descrip
			s.original_description.value = $('.md_tip').text().trim()

			//price
			if($('.after_price').text()){
				var p = $('.after_price').text().trim().replace(/[^0-9.]/g, "")
			}else if($('.big').text()){
				var p = $('.big').text().trim().replace(/[^0-9.]/g, "")
			}

			if(p){
				s.original_price.value = parseFloat(p)
			}
			

			//image URL
			if($('img','#fePrdImg01').attr('src')){
			    s.thumbnail_url = $('img','#fePrdImg01').attr('src')
			    s.main_image_url = $('img','#fePrdImg01').attr('src')
			}else if ($('img','#prdImg').attr('src')){
		    	s.thumbnail_url = $('img','#prdImg').attr('src')
			    s.main_image_url = $('img','#prdImg').attr('src')			
			}

			//get options type #1
			if($('.opt_sel a').length > 0){
				$('.opt_sel a').each(function(i, elm) {
					s.options.push({
						type: 'style', //style = top level option
						original_name: {
							value: $(this).text().trim() 
						},
					    product_id: $(this).attr('goods_no'),
					    available: true //it's avail because it has a "loadurl" attribute in a href
					})					
				})
				console.log(s)
				return s
			}
			
			//get options type #2

			//html queries to do for options
			var optionQ = []

			$('.c_list li').each(function(i, elm) {

				var opt_url = $('a',this).attr('loadurl') //url to get sub options for this options
				var name = $('.sec01',this).text().trim() //name
				var price = $('.sec02',this).text().trim().replace(/[^0-9.]/g, "") // price
				var product_id = $('a',this).attr('goodsno') //product id for this option
				var img = $('img',this).attr('src') //option image
				img = img.replace('_60','_150') //make option images larger (150px instead of 60px)

				//only process options that are still available
				if(opt_url){
					optionQ.push({
						opt_url: 'http://www.lotte.com'+opt_url,
						type: 'style', //style = top level option
						original_name: {
							value: name 
						},
						original_price: {
							value: price
						},
					    thumbnail_url:img,
					    main_image_url:img,
					    product_id: product_id,
					    available: true //it's avail because it has a "loadurl" attribute in a href
					})
				}
			})	

			//srape all product option URLs checking for suboptions ~
			var htmlQ = []
			for (i = 0; i < optionQ.length; i++) { 
				htmlQ.push(utils.scrapeURL(optionQ[i].opt_url))
			}
			var results = await Promise.all(htmlQ)

			//check html for child options
			var optionResults = []
			var rates = await fx_currency.getRates()
			for (i = 0; i < optionQ.length; i++) { 
				optionResults.push(processChildOptions(s,optionQ[i],results[i],rates))
			}

			//wait for all options to finish
			var options = await Promise.all(optionResults)

			s.options = [].concat.apply([], options) //condense into on obj array

			return s
			break

		case 'store.punyus.jp':
			//get product id
			s.product_id = await utils.urlValue(s.original_link,'detail',1)
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
			s.product_id = await utils.urlValue(s.original_link,'detail',1)
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
		        sizeText = sizeText.split('').map(c => c.charCodeAt())
		        sizeText = sizeText.filter(function (code) {
		          return (code >= 48 && code <= 57) || (code >= 65313 && code <= 65370)
		          // digits, and full-width latin characters
		        })
		        sizeText = sizeText.map(code => String.fromCharCode(code))
		        sizeText = sizeText.join('')

				s.options.push({
					type: 'size',
					original_name: {
						value: sizeText
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