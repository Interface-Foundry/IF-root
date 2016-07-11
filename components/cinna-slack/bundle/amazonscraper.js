
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var requestPromise = require('request-promise');
var mongoose = require('mongoose');
var co = require('co');

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
		alsoBought: [String],
		alsoViewed: [String]

		// ****************************************
		// Ignore these 2 other features for now
		// ****************************************
		// frequentlyBought: [String]
		// boughtAfterView: [String]
	});


	var Product = mongoose.model('Product', productSchema);
	Product.remove({}, function (err) {
		console.log('collection cleared')
	});

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

	var url = 'https://www.amazon.com/dp/B0033RVDVC/ref=nav_timeline_asin?_encoding=UTF8&psc=1';
	scrapePage(url);
// });



function checkASINs(asins)
{
	co(function * () {
		// console.log(asins)
		// for (var i in asins)
		// {
		// 	var tmp = asins[i]
		// 	Product.count( {asin: tmp}, function (err, count) {
		// 		if (count === 0) 
		// 			setTimeout(function () { scrapePage('https://www.amazon.com/dp/' + tmp + '/ref=nav_timeline_asin?_encoding=UTF8&psc=1'); }, 1000);
		// 	});
		// }

		async.eachSeries(asins, function (elem, callback) {
			// also check if asin is not already in the queue
			Product.count( {asin: elem}, function (err, count) {
				if (count === 0) 
					// enqueue elem;
					setTimeout(function () { scrapePage('https://www.amazon.com/dp/' + elem + '/ref=nav_timeline_asin?_encoding=UTF8&psc=1'); }, 1000);
			});
		});
	});
}

function scrapePage(url)
{
	proxiedRequest.get(url, function(err, response, body) 
	{
		// try {
			if (err) {
				console.log('&^&^&^&^&^&^&^&^&^');
				console.error('^^$%$% ERROR ' + err);	
			}

			// Try again?
			if (response.statusCode != 200) {
				console.log('-_-');
				setTimeout(function () { scrapePage(url); }, 1000);
			}

			// Cheerio
			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();

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

			var node = new Product( {
				asin: num,
				name: title,
				alsoBought: alsoBoughtASINs,
				alsoViewed: alsoViewedASINs
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
								checkASINs(alsoBoughtASINs);
								checkASINs(alsoViewedASINs);
								console.log(title);
							}
						});
					}
				});
			});

		// } catch(err) {
		// 	setTimeout(function () { 
		// 		console.log('rip')
		// 		scrapePage(url); 
		// 	}, 5000);
		// }

	});
}







