var brands = require('./terms').brand;

module.exports = function(brand) {
  return[]
}

module.exports.isBrand = function(text) {
  return brands.indexOf(text.toLowerCase()) >= 0;
}
