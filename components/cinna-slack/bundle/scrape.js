'use strict'

var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')
var async = require('async');
var requestPromise = require('request-promise');


//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;


/**
 callback should be function(error, product) {}
 where product = {
		   price: '',
		   color_options: [], // TODO scrape color options in the future
		   text: '',
		   full_html: ''
		 }
 */


// ***********************************************
//  CRAWLER
//  Start from Books/Arts & Photos/Architechture
// ***********************************************




// var url = 'https://www.amazon.com/dp/B00B4BJZ9G/ref=nav_timeline_asin?_encoding=UTF8&psc=1'
// var url = 'https://www.amazon.com/Suncast-DBW9200-Mocha-Wicker-99-Gallon/dp/B0044V3USU/ref=sr_1_1?m=ATVPDKIKX0DER&s=lawn-garden&ie=UTF8&qid=1467916291&sr=1-1&refinements=p_6%3AATVPDKIKX0DER%2Cp_72%3A2661619011'

 // var user = 'alyx';
 // var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
 // var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com']; //avail proxies

 //'us-il.proxymesh.com','us-ny.proxymesh.com','us-ca.proxymesh.com'
 //
 // var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
 // var port = '31280';
 // var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;

var proxiedRequest = request.defaults({
	proxy: 'http://127.0.0.1:24000',
	headers: {
		'Accept': 'text/html,application/xhtml+xml',
		//'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'en-US,en;q=0.8',
		// 'Avail-Dictionary':'qHs1hh9Q',
		'Cache-Control':'max-age=0',
		'Connection':'keep-alive',
		'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
		'Host':'www.amazon.com',
		'Origin':'http://www.amazon.com',
		//'Pragma':'no-cache',
		// 'Upgrade-Insecure-Requests':'1',
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36'
	}
});



function scrapeData($, featureId)
{
	var arr = [];
	var asins;
	$(featureId).each(function(i, elem) {
	if ($(this).attr('data-a-carousel-options'))
	{
		var data = JSON.parse($(this).attr('data-a-carousel-options'));
		asins = data.ajax.id_list;
	}
	if ($(this).attr('class').indexOf("p13n-sc-truncate") > -1)
		arr.push($(this).text().trim());
	});
	return [arr, asins]
}

function loadFirstPage(req_url, asins)
{
	// products will load a dif number of next products each time
	// var count = parseInt(req_url.match(/count=\d+/).slice(6))
	//      /[0-9]+/
	for (var i = 6; i < 15; ++i)
	{
	if (i + 1 == 15)
		req_url += asins[i];
	else
		req_url += asins[i] + '%2C';
	}
	return req_url
}

function proxyRequest(url, arr)
{
	proxiedRequest2.get(url, function(err, response, body) {
		if (err) {
			console.log('&^&^&^&^&^&^&^&^&^');
			console.log('^^$%$% ERROR ' + err);
		}
		if (response.statusCode != 200) {
			setTimeout(function () {
				proxyRequest(url, arr)
			}, 1000);
		}
		else {
			var $ = cheerio.load(body);
			$('html').find('script').remove()
			$('html').find('style').remove()

			$(' div').each(function(i, elem) {
				if ($(this).attr('class') == '\\"p13n-sc-truncate') {
					var productName = $(this).text().replace('\\n', '').trim();
					arr.push(productName.slice(0, productName.length - 2));
					// console.log('😊', arr);
				}
			});
		}
		console.log('😊', arr);
	}); 
}

function readPage(url)
{
	proxiedRequest.get(url, function(err, response, body) {
		// if (err) {
		// 	console.log('&^&^&^&^&^&^&^&^&^');
		// 	console.error('^^$%$% ERROR ' + err);	
		// }

		try {
			// stuff
			if (response.statusCode != 200) {
				setTimeout(function () {
					console.log('halp')
					readPage(url)
				}, 3000);
			}
			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();

			var hasChildren = false;
			$('.categoryRefinementsSection span').each(function(i, elem) {
				if ($(this).attr('class') == 'refinementLink') {
					var child = 'https://www.amazon.com' + $(this).parent().attr('href');
					hasChildren = true;

					setTimeout(function() { readPage(child); }, 1000);
				}
			});
			if (!hasChildren)
			{
				$('div.s-item-container h2').each(function() { 
					findData($(this).parent().attr('href')); 
				});
				for (var i = 2; i < 101; i++)
				{
					var nextPage = child + '&page=' + i;
					readNextPage(nextPage);
				}
			}

		} catch(err) {
			setTimeout(function () {
				// console.log('uhuh')
				readPage(url)
			}, 5000);
		}
		
	});
}

function loadChildren(url) 
{
	var children = readPage(url);
	for (var child in children) {
		setTimeout(function() { loadChildren(child); }, 1000);
	}
}

var rootURL = 'https://www.amazon.com/books-used-books-textbooks/b/ref=sd_allcat_bo?ie=UTF8&node=283155';
readPage(rootURL);

function findData(url) {
	try {
		// do stuff
		proxiedRequest.get(url, function(err, response, body) {

		// if(err){
		// 	console.log('&^&^&^&^&^&^&^&^&^');
		// 	console.error('^^$%$% ERROR ' + err);
		// }

	  // console.log(body)

	   // we will fill in these fields 🍹🌴
		var product = {
			price: '',
			text: '',
			full_html: '',
			asin: ''
		}

		var amazonSitePrice;
		var alsoViewed = [];
		var frequentlyBought = [];
		var alsoBought = [];
		var boughtAfterView = [];


		var $ = cheerio.load(body);
		$('html').find('script').remove()
		$('html').find('style').remove()

		product.asin = $('input#ASIN').val();
		product.title = $('#productTitle').text();
		$('.votingStripe').remove()
		product.reviews = $('#revMHRL').text();

		var alsoBoughtIDFeature;
		if ($('#purchase-similarities_feature_div div').attr('data-a-carousel-options'))
			alsoBoughtIDFeature = '#purchase-similarities_feature_div div';
		else if ($('#purchase-sims-feature div').attr('data-a-carousel-options'))
			alsoBoughtIDFeature = '#purchase-sims-feature div'

	  
		var alsoViewedIDFeature;
		if ($('#session-sims-feature div').attr('data-a-carousel-options'))
			alsoViewedIDFeature = '#session-sims-feature div';
		else if ($('#fallbacksession-sims-feature div').attr('data-a-carousel-options'))
			alsoViewedIDFeature = '#fallbacksession-sims-feature div';


		// fix these
		var alsoBoughtReqUrl = 'https://www.amazon.com/gp/p13n-shared/faceout-partial?featureId=SimilaritiesCarousel&widgetTemplateClass=PI%3A%3ASimilarities%3A%3AViewTemplates%3A%3ACarousel%3A%3ADesktop&imageHeight=160&faceoutTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProduct%3A%3ADesktop%3A%3ACarouselFaceout&auiDeviceType=desktop&imageWidth=160&schemaVersion=2&productDetailsTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProductDetails%3A%3ADesktop%3A%3ABase&maxLineCount=6&count=9&offset=6&asins=';
		var alsoViewedReqUrl = 'https://www.amazon.com/gp/p13n-shared/faceout-partial?featureId=SimilaritiesCarousel&widgetTemplateClass=PI%3A%3ASimilarities%3A%3AViewTemplates%3A%3ACarousel%3A%3ADesktop&imageHeight=160&faceoutTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProduct%3A%3ADesktop%3A%3ACarouselFaceout&auiDeviceType=desktop&imageWidth=160&schemaVersion=2&productDetailsTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProductDetails%3A%3ADesktop%3A%3ABase&maxLineCount=6&count=9&offset=6&asins=';
	  
	  
		// Create proxy for subsequent requests for more recommended items
		var proxiedRequest2 = request.defaults({
			proxy: 'http://127.0.0.1:24000',
			headers: {
				// 'Accept': 'text/html,*/*',
				// 'Accept-Encoding': 'gzip',
				// 'Accept-Language': 'en-US,en;q=0.8',
				// 'Avail-Dictionary': '4f4keJHV',
				'Connection': 'keep-alive',
				'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
				// 'Content-Type': 'application/json; charset=utf-8',
				'Host': 'www.amazon.com',
				'Referer': url,
				// 'Referer': 'https://www.amazon.com/Honeywell-HY-280-QuietSet-Whole-Tower/dp/B00B4BJZ9G/ref=pd_ybh_a_1?ie=UTF8&psc=1&refRID=R19GN4FMWEEW3YD7KHHN',
				// 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
				'X-Requested-With': 'XMLHttpRequest'
			}
		});
	  

		if (alsoBoughtIDFeature) 
		{
			var alsoBoughtScrape = scrapeData($, alsoBoughtIDFeature);
			alsoBought = alsoBoughtScrape[0];
			var alsoBoughtASINS = alsoBoughtScrape[1];
			// alsoBoughtReqUrl = loadFirstPage(alsoBoughtReqUrl, alsoBoughtASINS);
			// proxyRequest(alsoBoughtReqUrl, alsoBought);
		}
	  
		if (alsoViewedIDFeature) 
		{
			var alsoViewedScrape = scrapeData($, alsoViewedIDFeature);
			alsoViewed = alsoViewedScrape[0];
			var alsoViewedASINS = alsoViewedScrape[1];
			// alsoViewedReqUrl = loadFirstPage(alsoViewedReqUrl, alsoViewedASINS);
			// proxyRequest(alsoViewedReqUrl, alsoViewed);
		}

	  // for subsequent pages, load 5:
	  // for (var i = 15; i < asin_list.length; i += 5)
	  // {
	  //   request_url = 'https://www.amazon.com/gp/p13n-shared/faceout-partial?featureId=SimilaritiesCarousel&reftagPrefix=pd_sim_201&widgetTemplateClass=PI%3A%3ASimilarities%3A%3AViewTemplates%3A%3ACarousel%3A%3ADesktop&imageHeight=160&faceoutTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProduct%3A%3ADesktop%3A%3ACarouselFaceout&auiDeviceType=desktop&imageWidth=160&schemaVersion=2&productDetailsTemplateClass=PI%3A%3AP13N%3A%3AViewTemplates%3A%3AProductDetails%3A%3ADesktop%3A%3ABase&maxLineCount=6&count=5&offset=' + (i + 1).toString() + '&asins='
	  //   for (var j = 0; j < 5; ++j)
	  //   {
	  //     if (j + 1 == 5)
	  //       request_url += asin_list[i + j];
	  //     else 
	  //       request_url += asin_list[i + j] + '%2C';
	  //   }
	  //   request_urls.push(request_url);
	  // }

	  // console.log(request_urls)

	  /*
	  
	  */
		// Frequently Bought Feature
		$('#sims-fbt-container div img').each(function(i, elem) {
			frequentlyBought.push($(this).attr('alt'));
		});
		// the first item is the product itself
		frequentlyBought.shift();

		// What Other Customers Bought after Viewing this Item
		$('#view_to_purchase-sims-feature img').each(function(i, elem) {
			boughtAfterView.push($(this).attr('alt'));
		});
	  

	  



	  // console.log('😊 ', alsoBought);

	  // async.eachSeries(request_urls, function (i, callback) {

	  //   // console.log(request_urls[i])
	  //   proxiedRequest2.get(i, function(err, response, body) {
	  //     if(err){
	  //       console.log('&^&^&^&^&^&^&^&^&^');
	  //       console.error('^^$%$% ERROR ' + err);
	  //     }

	  //     console.log(body)

	  //     var $ = cheerio.load(body);
	  //     $('html').find('script').remove()
	  //     $('html').find('style').remove()

	  //     $('#purchase-similarities_feature_div div').each(function(i, elem) {
	  //       if ($(this).attr('class') == "p13n-sc-truncate p13n-sc-line-clamp-4") 
	  //         alsoBought.push($(this).text().trim());
	  //      });
	  //   });

	  //   setTimeout(function () {
	  //     callback()
	  //   }, 1000)
		 
	  // }, function (err) {
	  //   if (err) { 
	  //     console.error('foreach err ',err)
	  //   }
	  //   console.log('Well done :-)!');
	  // });

	  
	  

	  // proxiedRequest2.get(url2, function(err, response, body) {
	  //   if(err) {
	  //    console.log('&^&^&^&^&^&^&^&^&^');
	  //    console.error('^^$%$% ERROR ' + err);
	  //  }


	   //try for miniATF
	   // if ($('#miniATF_price').text()){  //excluding scrapes with multiple prices (-) in field
	   //     console.log('😊 kk');
	   //     amazonSitePrice = $('#miniATF_price').text().trim();
	   // }
	   // //if no miniATF, try for priceblock_ourprice
	   // else if ($('#priceblock_ourprice').text()){
	   //     console.log('😊 kk');
	   //     amazonSitePrice = $('#priceblock_ourprice').text().trim();
	   // }
	   // else if ($('.buybox-price').text()){
	   //     console.log('😊 kk');
	   //     amazonSitePrice = $('.buybox-price').text().trim();
	   //     amazonSitePrice = amazonSitePrice.split("\n");
	   //     amazonSitePrice = amazonSitePrice[0];
	   // }
	   // else if ($('#priceblock_saleprice').text()){
	   //     console.log('😊 kk');
	   //     amazonSitePrice = $('#priceblock_saleprice').text().trim();
	   //     amazonSitePrice = amazonSitePrice.split("\n");
	   //     amazonSitePrice = amazonSitePrice[0];
	   // }
	   // else {
	   //   console.log('NO PRICE FOUND 😊😊😊😊😊😊😊 ',url);
	   // }
	   //we have price from website
		if (amazonSitePrice){
			product.price = amazonSitePrice;
		}
		if (alsoViewed[0]) {
			product.aViewed = alsoViewed;
		}
		else if (alsoBought[0]) {
			product.aBought = alsoBought;
		}
		if (frequentlyBought[0]) {
			product.fBought = frequentlyBought;
		}

	   	//Get reviews
		var reviewCount = $('#acrCustomerReviewText').text().trim();
		var rating = $('#acrPopover').text().trim();




	   	//we found an image alternate for missing item images
		if($('#imgTagWrapperId').children('img').attr('data-old-hires')){
		 	product.altImage = $('#imgTagWrapperId').children('img').attr('data-old-hires');
		} else if ($('#imgTagWrapperId').children('img').attr('src') && checkURL($('#imgTagWrapperId').children('img').attr('src'))){
		 	console.log('wow we found an image url um ok, proceed....proceed...');
		 	product.altImage = $('#imgTagWrapperId').children('img').attr('src');
		}

		var textParts = {
			featureBulletText: $('#featurebullets_feature_div').text().replace(/\s+/g, ' '),
			descriptionText: $('#productDescription').text().replace(/\s+/g, ' '),
			productDetails: $('#productDetailsTable').text().replace(/<li>([^<li>]*)<\/li>/g, ' $1. ').replace(/\s+/g, ' '),
			aplusProductDescription: $('#aplusProductDescription').text().replace(/\s+/g, ' ')
		};

	   	// glue all the text parts together into one document
		product.text = Object.keys(textParts).map(function(key) { return textParts[key] }).join('\n\n');


	   	//console.log('product obj: ',product)
	});

	} catch(err) {
		setTimeout(function () {
				console.log('uhuh')
				findData(url);
			}, 5000);
	}

	

}


function checkURL(url) {
	return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}
