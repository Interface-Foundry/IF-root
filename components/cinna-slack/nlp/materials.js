// 🐑 🐑 🐑 🐑
module.exports = function(material) {
  return []
}

module.exports.isMaterial = function(text) {
  return !!materials[text.toLowerCase()]
}

var material_names = [
  'wool',
  'denim',
  'sheer',
  'cotton'
];

var materials = material_names.reduce(function(m, name) {
  m[name] = name;
  return m;
}, {})
