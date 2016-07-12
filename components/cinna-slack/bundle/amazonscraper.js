
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var requestPromise = require('request-promise');
var mongoose = require('mongoose');
var co = require('co');
var job = require('../JobQueue/job');

//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;

// setup mongodb
mongoose.connect('mongodb://localhost/amazonData');

// co(function * () {
	var productSchema = mongoose.Schema( {
		asin: String,
		name: String,
		topLevelURL: String,
		category: [String],
		alsoBought: [String],
		alsoViewed: [String]

		// ****************************************
		// Ignore these 2 other features for now
		// ****************************************
		// frequentlyBought: [String]
		// boughtAfterView: [String]
	});


	var Product = mongoose.model('Product', productSchema);

	// %%%%%%%%%%%%%%%%%%%%%% REMOVE ME %%%%%%%%%%%%%%%%%%%%%%
	// Product.remove({}, function (err) {
	// 	console.log('collection cleared')
	// });
	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	// Make proxy and URL:
	var proxiedRequest = request.defaults( {
		proxy: 'http://127.0.0.1:24000',
		headers: {
			'Accept': 'text/html,application/xhtml+xml',
			'Accept-Language':'en-US,en;q=0.8',
			'Cache-Control':'max-age=0',
			'Connection':'keep-alive',
			'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
			'Host':'www.amazon.com',
			'Origin':'http://www.amazon.com',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36'
		}
	});

	var rootCategoryPage = 'https://www.amazon.com/electronics-store/b/ref=topnav_storetab_e?ie=UTF8&node=172282';
	// var url = 'https://www.amazon.com/dp/B0033RVDVC/ref=nav_timeline_asin?_encoding=UTF8&psc=1';
	
	//*********************************
	// RUN PROGRAM
	//*********************************
	findSubcategories(rootCategoryPage);
	// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// });

var crawler = job('crawler-job', function(data, done) {
	scrapePage('https://www.amazon.com/dp/' + data) //+ '/ref=nav_timeline_asin?_encoding=UTF8&psc=1') 
	setTimeout(function () { done(null, 'woooow') }, 500)
})

var categoryCrawler = job('categoryCrawler-job', function(data, done) {
	findSubcategories(data) 
	setTimeout(function () { done(null, 'woooow') }, 1000)
})

var readPageCrawler = job('readPageCrawler-job', function(data, done) {
	readPage(data);
	setTimeout(function () { done(null, 'woooow') }, 1000)
})

function readPage(url)
{	
	proxiedRequest.get(url, function(err, response, body) {
		try {
			if (response.statusCode != 200) 
				setTimeout(function () { readPageCrawler(url); }, 1000);

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();


			$('li.s-result-item').each(function (i, elem) {
				var asin = $(this).attr('data-asin');
				var url = 'https://www.amazon.com/dp/' + asin;
				// console.log(url);
				Product.count( {asin: asin}, function (err, count) {
					if (count === 0)
						scrapePage(url);		
				});
			});

			if ($('a#pagnNextLink').attr('href'))
				readPageCrawler('https://www.amazon.com' + $('a#pagnNextLink').attr('href'));
		} catch(err) {
			setTimeout(function () { readPageCrawler(url); }, 1000);
		}
	});
	
}

function findSubcategories(url)
{
	proxiedRequest.get(url, function(err, response, body) {
		try {
			if (response.statusCode != 200) 
				setTimeout(function () { findSubcategories(url); }, 1000);

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();

			var hasChildren = false;
			$('.categoryRefinementsSection span').each(function(i, elem) {
				if ($(this).attr('class') == 'refinementLink') 
				{
					if ($(this).parent().attr('href'))
					{
						var child = 'https://www.amazon.com' + $(this).parent().attr('href');
						hasChildren = true;

						setTimeout(function() { categoryCrawler(child); }, 1000);	
					}
				}
			});

			$('div[class="left_nav browseBox"] ul li a').each(function(i, elem) {
				var child = 'https://www.amazon.com' + $(this).attr('href');
				hasChildren = true;

				setTimeout(function () { categoryCrawler(child); }, 1000);
			});

			if (!hasChildren) 
				readPageCrawler(url);

		} catch(err) {
			setTimeout(function () { categoryCrawler(url) }, 5000);
		}
	});
}

function checkASINs(asins)
{
	async.forEach(asins, function (elem, callback) {
		Product.count( {asin: elem}, function (err, count) {
			if (count === 0) 
				setTimeout(function () { crawler(elem); }, 1250);
				// ^ enqueue asins
		});
	});
}

function scrapePage(url)
{
	proxiedRequest.get(url, function(err, response, body) 
	{
		try {
			// if (err) {
			// 	console.log('&^&^&^&^&^&^&^&^&^');
			// 	console.error('^^$%$% ERROR ' + err);	
			// }

			// Try again?
			if (response.statusCode != 200) {
				console.log(':(');
				setTimeout(function () { scrapePage(url); }, 1000);
			}

			// Cheerio
			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();


			// Find categories
			var categories = [];
			$('.a-link-normal.a-color-tertiary').each(function (i, elem) {
				categories.push($(this).text().trim());
			})

			// Check for the existence of features
			var alsoBoughtIDFeature;
			if ($('#purchase-similarities_feature_div div').attr('data-a-carousel-options'))
				alsoBoughtIDFeature = '#purchase-similarities_feature_div div';
			else if ($('#purchase-sims-feature div').attr('data-a-carousel-options'))
				alsoBoughtIDFeature = '#purchase-sims-feature div';

			var alsoViewedIDFeature;
			if ($('#session-sims-feature div').attr('data-a-carousel-options'))
				alsoViewedIDFeature = '#session-sims-feature div';
			else if ($('#fallbacksession-sims-feature div').attr('data-a-carousel-options'))
				alsoViewedIDFeature = '#fallbacksession-sims-feature div';

			// Define fields for schema
			var num = $('input#ASIN').val();
			var title = $('#productTitle').text().trim();
			var alsoBoughtASINs = [];
			var alsoViewedASINs = [];
			
			function scrapeData(featureId)
			{
				$(featureId).each(function(i, elem) 
				{
					if ($(this).attr('data-a-carousel-options'))
					{
						var data = JSON.parse($(this).attr('data-a-carousel-options'));
						asins = data.ajax.id_list;
					}
				});
				// only interested in the first 12
				return asins.slice(0, 12);
			}

			if (alsoBoughtIDFeature) 
				alsoBoughtASINs = scrapeData(alsoBoughtIDFeature);
			if (alsoViewedIDFeature) 
				alsoViewedASINs = scrapeData(alsoViewedIDFeature);

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

			var node = new Product( {
				asin: num,
				name: title,
				category: categories,

				alsoBought: alsoBoughtASINs,
				alsoViewed: alsoViewedASINs,

				frequentlyBought: frequentlyBought,
				boughtAfterView: boughtAfterView
			});

			co(function * () {
				Product.count( {name: title}, function (err, count) {
					if (count === 0) {
						node.save( function(err, node) 
						{
							if (err)
								console.log(err);
							else {
								// throw into queue
								console.log(title);
								checkASINs(alsoBoughtASINs);
								// checkASINs(alsoViewedASINs);
								// checkASINs(frequentlyBought);
								// checkASINs(boughtAfterView);
							}
						});
					}
				});
			});

		} catch(err) {
			setTimeout(function () { 
				scrapePage(url); 
			}, 5000);
		}

	});
}

var isEmpty = false;
setInterval(function () {
	co(function () {
		if (isEmpty === true) {
			console.log("############### EXITING ###############");
			process.exit(0);
		}
		crawler.count(function (err, count) {
			if (!err && count === 0) {
				console.log("############### QUEUE IS EMPTY ###############");
				isEmpty = true;
			}
		});
	});
}, 60000);







