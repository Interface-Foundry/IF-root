var ntc = require('./name_that_color')

// return a list of similar colors

module.exports = function(color) {
  return [];
}
if (!module.parent) {
  console.log('run tests with mocha')
}
if (module.parent && module.parent.filename.indexOf('mocha.js') > 0) {
  var tests = [
    {color: 'blue', result: ['navy', 'aqua']}
  ];
  var should = require('should')
  describe('similar color engine', function() {
    tests.map(function(t) {
      it(t.color, function() {
        module.exports(t.color).should.deepEqual(t.result);
      })
    })
  })
}
