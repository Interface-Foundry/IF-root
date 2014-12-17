# is-rtf [![Build Status](https://travis-ci.org/veacks/is_rtf.svg?branch=master)](https://travis-ci.org/veacks/is_rtf)

> Check if a Buffer/Uint8Array is a RTF file

## Install

```sh
$ npm install --save is-rtf
```

## Usage

```js
var isRtf = require('is-rtf');
var read = require('fs').readFileSync;

isRtf(read('test.rtf'));
// => true
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) © [Valentin Dubois](https://github.com/veacks)