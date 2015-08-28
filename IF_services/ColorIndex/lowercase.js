function rgbToHex(rgb) {
   return  "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1, 7);
}

function test() {
    var should = require('chai').should();
    var rgb = [49, 57, 136];
    var hex = rgbToHex(rgb);
    hex.should.eql('#313988');
}

module.exports = {
    rgbToHex: rgbToHex,
    test: test
}

if (!module.parent) test();