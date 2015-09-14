var kipScrapeTools = require('./kipScrapeTools');

var a = [1, 2, 3, 4, 5, 6, 7]
a.map(function() {
  console.log('queing');
  kipScrapeTools.slowLoad('https://google.com', function($) {
    console.log(new Date());
  })
})
