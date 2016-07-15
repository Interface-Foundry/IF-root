module.exports = function(size) {
  return []
}

module.exports.isSize = function(text) {
  // return !!sizes[text.toLowerCase()]
  return !!sizes[text.toString().toLowerCase()]
}

var size_names = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl',
  'xxxl',
  'small',
  'medium',
  'large',
  'extra large',
  'extra small'
];

var sizes = size_names.reduce(function(s, name) {
  s[name] = name;
  return s
}, {})
