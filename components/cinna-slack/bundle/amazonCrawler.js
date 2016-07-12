
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var requestPromise = require('request-promise');
var co = require('co');
var job = require('../JobQueue/job');

//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;

var rootCategoryPage = 'https://www.amazon.com/electronics-store/b/ref=topnav_storetab_e?ie=UTF8&node=172282';

var proxiedRequest = request.defaults({
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

var categoryCrawler = job('categoryCrawler-job', function(data, done) {
	readPage(data) 
	setTimeout(function () { done(null, 'woooow') }, 1000)
})

// var readPageCrawler = job('readPageCrawler-job', function(data, done) {
// 	findSubcategories(data);
// 	setTimeout(function () { done(null, 'woooow') }, 1000)
// })

function readPage(url)
{	
	proxiedRequest.get(url, function(err, response, body) {
		try {
			if (response.statusCode != 200) 
				setTimeout(function () { readPage(url); }, 1000);

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();


			$('li.s-result-item').each(function (i, elem) {
				var asin = $(this).attr('data-asin');
				var url = 'https://www.amazon.com/dp/' + asin;
				console.log(url);
				// scrapePage(url);
			});

			if ($('a#pagnNextLink').attr('href'))
				readPage('https://www.amazon.com' + $('a#pagnNextLink').attr('href'));
		} catch(err) {
			setTimeout(function () { readPage(url); }, 1000);
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
			console.log('RIPPPP')
			setTimeout(function () { categoryCrawler(url) }, 5000);
		}
	});
}

findSubcategories(rootCategoryPage);






