var is_rtf = require("./index.js");

var read = require('fs').readFileSync;

console.log("It should return true when scanning a RTF file stream:" + is_rtf(read('test.rtf')));
console.log("It should return false when scanning another stream:" + is_rtf("ABCDEFGHIJKLMNOPQRSTUVWXYZ"));