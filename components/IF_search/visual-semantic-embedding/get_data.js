var wget = require('wget-improved');
var out = __dirname + '/data/';
require('colors');

var files = [
  'http://www.cs.toronto.edu/~rkiros/datasets/f8k.zip',
  'http://www.cs.toronto.edu/~rkiros/datasets/f30k.zip',
  'http://www.cs.toronto.edu/~rkiros/datasets/coco.zip',
  'http://www.cs.toronto.edu/~rkiros/models/vse.zip'
];

files.map(function(f) {
  var a = wget.download(f, out + f.split('/').pop(), {})
  a.on('progress', function(p) {
    console.log(p);
  })
  a.on('end', function(o) {
    console.log(('done with ' + f).rainbow);
  })
})
