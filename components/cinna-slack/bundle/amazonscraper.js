
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var requestPromise = require('request-promise');
var mongoose = require('mongoose');
var co = require('co');
var job = require('./job');
var db = require('./job_schema.js')

//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;

// setup mongodb
mongoose.connect('mongodb://localhost/amazonData2');

// co(function * () {
	var productSchema = mongoose.Schema( {
		asin: String,
		name: String,
		topLevelURL: String,
		category: [String],
		alsoBought: [String],
		alsoViewed: [String],

		frequentlyBought: [String],
		boughtAfterView: [String],

		textParts: {
			featureBulletText: String,
			descriptionText: String,
			productDetails: String,
			aplusProductDescription: String
		},
		reviews: [String]
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

    // var rootCategoryPage = 'https://www.amazon.com/books-used-books-textbooks/b/ref=sd_allcat_bo?ie=UTF8&node=283155';
	// var rootCategoryPage = 'https://www.amazon.com/electronics-store/b/ref=topnav_storetab_e?ie=UTF8&node=172282';
	var rootCategoryPage = 'https://www.amazon.com/s/ref=lp_2622272011_nr_n_0?fst=as%3Aoff&rh=n%3A468642%2Cn%3A%2111846801%2Cn%3A2622269011%2Cn%3A2622272011%2Cn%3A3074359011&bbn=2622272011&ie=UTF8&qid=1469480386&rnid=2622272011';
	// var url = 'https://www.amazon.com/dp/B0033RVDVC/ref=nav_timeline_asin?_encoding=UTF8&psc=1';
	
	//*********************************
	// RUN PROGRAM
	//*********************************
	findSubcategories(rootCategoryPage);
	// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// });

var crawler = job('crawler-job', function(data, done) {
	console.log('Searching ASIN');
	scrapePage(data) //+ '/ref=nav_timeline_asin?_encoding=UTF8&psc=1') 
	setTimeout(function () { done(null, 'woooow') }, 1000)
})

var categoryCrawler = job('categoryCrawler-job', function(data, done) {
	console.log('Searching category');
	findSubcategories(data) 
	setTimeout(function () { done(null, 'woooow') }, 50000)
})

var readPageCrawler = job('readPageCrawler-job', function(data, done) {
	console.log('Searching results');
	readPage(data);
	setTimeout(function () { done(null, 'woooow') }, 50000)
})

function readPage(url)
{	
    if (url.indexOf('product') > -1)
    {
        crawler(url);
        return;
    }

	proxiedRequest.get(url, function(err, response, body) {
		try {
            co(function * () {
            
			if (response.statusCode != 200) {
				setTimeout(function () { readPageCrawler(url); }, 1000);
                return;
            }

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();


			$('li.s-result-item').each(function (i, elem) {
				var asin = $(this).attr('data-asin');
				var url = 'https://www.amazon.com/dp/' + asin;
				// console.log(url);
				db.count( {inputData: 'https://www.amazon.com/dp/' + elem}, function (err, cnt) {
					Product.count( {asin: asin}, function (err, count) {
						if (count === 0 && cnt === 0)
							setTimeout(function () { crawler(url); }, 50) 
					});
				});
			});

			if ($('a#pagnNextLink').attr('href'))
				readPageCrawler('https://www.amazon.com' + $('a#pagnNextLink').attr('href'));
            delete $
            });
		} catch(err) {
			setTimeout(function () { readPageCrawler(url); }, 100);
		}
	});
}

function findSubcategories(url)
{
    if (url.indexOf('product') > -1)
    {
        crawler(url);
        return;
    }
    if (url.indexOf('www.amazon.comhttps') > -1)
        return;

	proxiedRequest.get(url, function(err, response, body) {
		try {
			if (response.statusCode != 200) { 
				setTimeout(function () { categoryCrawler(url); }, 1000);
                return;
            }

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();

			var hasChildren = false;
			$('.categoryRefinementsSection span').each(function(i, elem) {
				if ($(this).attr('class') == 'refinementLink') 
				{
					if ($(this).parent().attr('href'))
					{
                        if (child.indexOf('amazon.com') === -1)
                        {
						    var child = 'https://www.amazon.com' + $(this).parent().attr('href');
						    hasChildren = true;
						    setTimeout(function() { categoryCrawler(child); }, 1000);
                        }
					}
				}
			});

			$('div[class="left_nav browseBox"] ul li a').each(function(i, elem) {
				var child = 'https://www.amazon.com' + $(this).attr('href');
				hasChildren = true;
                
				setTimeout(function () { categoryCrawler(child); }, 1000);
			});

			if (!hasChildren) { 
				readPageCrawler(url);
                return;
            }

		} catch(err) {
			setTimeout(function () { categoryCrawler(url) }, 5000);
		}
	});
}

function checkASINs(asins)
{
	async.forEach(asins, function (elem, callback) {
        db.count( {inputData: 'https://www.amazon.com/dp/' + elem}, function (err, cnt) {
		    Product.count( {asin: elem}, function (err, count) {
			    if (count === 0 && cnt === 0) {
                    var url = 'https://www.amazon.com/dp/' + elem
				    setTimeout(function () { crawler(url); }, 100);
				    // ^ enqueue asins
                }
		    });
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
				setTimeout(function () { crawler(url); }, 1000);
                return;
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
			var frequentlyBought = [];
			$('#sims-fbt-container div img').each(function(i, elem) {
				frequentlyBought.push($(this).attr('alt'));
			});
			// the first item is the product itself
			frequentlyBought.shift();
			
			// What Other Customers Bought after Viewing this Item
			var boughtAfterView = [];
			$('#view_to_purchase-sims-feature img').each(function(i, elem) {
				boughtAfterView.push($(this).attr('alt'));
			});

			//
			// MORE FEATURES
			//
			
			//Get reviews
			var reviews = [];
			$('div#revMHRL.a-section>div.a-section.celwidget>div.a-row.a-spacing-small>div.a-section').each(function(i, elem) {
				if ($(this))
					reviews.push($(this).text().replace(/<br>([^<br>]*)<\/br>/g, '' ).replace('\n', ' '))
			})
			// var reviewCount = $('#acrCustomerReviewText').text().trim();
			// var rating = $('#acrPopover').text().trim();

			// Text Parts
			var textParts = {
				featureBulletText: $('#featurebullets_feature_div').text().replace(/\s+/g, ' '),
				descriptionText: $('#productDescription').text().replace(/\s+/g, ' '),
				productDetails: $('#productDetailsTable').text().replace(/<li>([^<li>]*)<\/li>/g, ' $1. ').replace(/\s+/g, ' '),
				aplusProductDescription: $('#aplusProductDescription').text().replace(/\s+/g, ' ')
			};

			var node = new Product( {
				asin: num,
				name: title,
				category: categories,

				alsoBought: alsoBoughtASINs,
				alsoViewed: alsoViewedASINs,

				frequentlyBought: frequentlyBought,
				boughtAfterView: boughtAfterView,

				textParts: textParts,
				reviews: reviews
			});

			co(function * () {
				Product.count( {name: title}, function (err, count) {
				    if (count === 0) {
					    console.log('checking...')
					    node.save( function(err, node) 
			    	    {
						    if (err)
						    	console.log(err);
							else {
								// throw into queue
                                delete $
								checkASINs(alsoBoughtASINs);
								console.log(title);
							}
						});
					}
				});
			});

		} catch(err) {
			setTimeout(function () { crawler(url); }, 5000);
            return;
		}
	});
}


var missedMinutes = 0;
setInterval(function () {
	co(function () {
		if (missedMinutes === 5) {
			console.log("############### EXITING ###############");
			process.exit(0);
		}
		db.count({'flags.inProgress': true}, function (err, count) {
			if (!err && count === 0) {
				console.log("############### QUEUE IS EMPTY ###############");
				missedMinutes++;
			} else 
                missedMinutes = 0;
		});
	});
}, 60000);





