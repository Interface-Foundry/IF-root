var searchterms = require('./searchterms');
require('colors');
var fs = require('fs');
var _ = require('lodash');

var testQueries = [
  'black light jacket',
  'fall overcoat',
  'purple dress',
  'leather boots',
  'skinny jeans',
  'red high heels',
  'black pants',
  'floral leggings',
  'black tights',
  'grey booties',
  'brown boots',
  'leather jacket',
  'denim jacket',
  'cardigan',
  'cropped denim jacket',
  'flanel button down',
  'light washed skinny jeans',
  'dark washed skinny jeans',
  'mens jacket',
  'mens suit'
];

var google_trends = fs.readFileSync('./google_trends.txt', 'utf8').split('\n');
testQueries = testQueries.concat(google_trends);

console.log(searchterms.buckets);
console.log(searchterms.combos);

var uncategorizedWords = [];
testQueries.map(function(q) {
  console.log(q.blue);
  var result = searchterms.parse(q);
  Object.keys(result).map(function(k) {
    var str = ['  '];
    if (k === 'uncategorized') {
      str.push(k.red);
      uncategorizedWords = uncategorizedWords.concat(result[k].words);
    } else {
      str.push(k);
    }
    str.push(' (');
    str.push(('' + result[k].boost).green);
    str.push('): ');
    str.push(result[k].words.join(', '));
    console.log(str.join(''));
  })
})
uncategorizedWords = _.unique(uncategorizedWords);

console.log(("Found " + uncategorizedWords.length + " uncategorized words").red);
console.log(uncategorizedWords.join(', '));
