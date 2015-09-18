var searchterms = require('./searchterms');
require('colors');
var fs = require('fs');

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
  'dark washed skinny jeans'
];

var google_trends = fs.readFileSync('./google_trends.txt', 'utf8').split('\n');
testQueries = testQueries.concat(google_trends);


testQueries.map(function(q) {
  console.log(q.blue);
  var result = searchterms.parse(q);
  Object.keys(result).map(function(k) {
    var str = ['  '];
    str.push(k === 'uncategorized' ? k.red : k);
    str.push(': ');
    str.push(result[k].join(', '));
    console.log(str.join(''));
  })
})
