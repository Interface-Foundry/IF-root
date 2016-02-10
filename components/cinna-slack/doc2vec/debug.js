var fs = require('fs')
var cheerio = require('cheerio')
var html = fs.readFileSync('./debug.js', 'utf8')
module.exports = cheerio.load(html)
