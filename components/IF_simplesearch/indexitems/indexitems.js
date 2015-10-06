var fs = require('fs');
var db = require('db');
var async = require('async');

var stream = db.Landmarks
    .find({})
    .populate('parents')
    .stream()
    //redis queue?
stream.on('data', function(lm) {
    fs.appendFile('text.xml', '<?xml version="1.0" encoding="UTF-8"?> < urlset xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns: xsi = "http://www.w3.org/2001/XMLSchema-instance"
        xsi: schemaLocation = "http://www.sitemaps.org/schemas/sitemap/0.9
        http: //www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        <url>
          <loc> https: //kipsearch.com/</loc>
          <lastmod> 2015 - 09 - 27 T21: 20: 31 + 00: 00 </lastmod> 
          <changefreq> always </changefreq> 
        </url>' , function(err) {
        if (err) {
            return console.log(err)
        }
        async.eachSeries(lm.parents, function iterator(parent, callback) {
            fs.appendFile('text.xml', '\n<url><loc>http://www.kipsearch.com/t/' + parent._id + '/' + lm._id + '</loc><lastmod>' + (new Date().toString()) + '</lastmod><changefreq>weekly</changefreq></url>', function(err) {});
        }, function finished(err) {
            if (err) console.log(err)
            fs.appendFile('text.xml', '\n</urlset>', function(err) {});
        })
    });
// console.log(lm._id, lm.parents.map(function(p) {
//     return p._id
// }));
})

// run NODE_ENV=digitalocean before indexitems.js (NODE_ENV=digitalocean node indexitems.js)