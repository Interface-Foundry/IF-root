var snacks = module.exports.snacks = ['B017L0BL5E', ' B013KTYFYO', 'B00URCF2B8', 'B01BXU1RV6']

var drinks = module.exports.drinks = ['B0048IAH30', 'B00L84GH9K', 'B00787YLJE']

var supplies = module.exports.supplies = ['B00006IFKT', 'B01A6JLR88', 'B01G7J5QN8']

var getBundle = module.exports.getBundle = function(choice) {
  var bundles = {
    'snacks': function () {
      return snacks;
    },
    'drinks': function () {
       return drinks;;
    },
    'supplies': function () {
       return supplies;;
    },
    'default': function () {
      return snacks;
    }
  };
  var bundle = (bundles[choice] || bundles['default'])();
  return bundle
}