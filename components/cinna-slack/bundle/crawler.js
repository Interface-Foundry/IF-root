
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');
var requestPromise = require('request-promise');
var co = require('co');

//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;

var rootURL = 'https://www.amazon.com/toys/b/ref=sd_allcat_tg?ie=UTF8&node=165793011&nocache=1467989734067';

// let's try with books/Arts & Photos/Architecture first:

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

function readNextPage(url)
{
	proxiedRequest.get(url, function(err, response, body) {
		try {
			// stuff

			if (response.statusCode != 200) {
				setTimeout(function () {
					console.log('halp')
					readNextPage(url)
				}, 3000);
			}

			var $ = cheerio.load(body);
			$('html').find('script').remove();
			$('html').find('style').remove();

			$('div.s-item-container h2').each(function() {
				console.log($(this).parent().attr('href'));
			});

		} catch(err) {
			setTimeout(function () {
				readNextPage(url);
			}, 5000);
		}
	})
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
					console.log($(this).parent().attr('href'))
				})
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

readPage(rootURL);










