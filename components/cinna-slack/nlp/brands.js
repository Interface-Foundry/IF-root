module.exports = function(brand) {
  return[]
}

module.exports.isBrand = function(text) {
  return [
    'zara',
    'macys'
  ].indexOf(text.toLowerCase()) >= 0;
}
