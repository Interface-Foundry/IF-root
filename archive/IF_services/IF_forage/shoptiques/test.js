var scrapeItem = require('./scrape_item');


//scrapeItem('http://www.shoptiques.com/products/cory-lynn-savanna-crop-top').then(function(data) {
//    console.log(JSON.stringify(data));
//});

scrapeItem('http://www.shoptiques.com/products/solid-color-knit-skirt').then(function(data) {
    console.log(JSON.stringify(data));
});

