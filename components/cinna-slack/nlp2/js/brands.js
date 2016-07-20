var brands = require('./terms').brand;

module.exports = function(brand) {
  return[]
}

module.exports.isBrand = function(text) {
  return brands.indexOf(text.toString().toLowerCase()) >= 0;
  // return brands.indexOf(text.toLowerCase()) >= 0;
}

if (!module.parent) {
  console.log(module.exports.isBrand(process.argv.slice(2).join(' ')))
}
