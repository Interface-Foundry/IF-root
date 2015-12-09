var material_names = require('./terms').fabric;

// 🐑 🐑 🐑 🐑
module.exports = function(material) {
  return []
}

module.exports.isMaterial = function(text) {
  return material_names.indexOf(text.toLowerCase()) >= 0;
}

var materials = material_names.reduce(function(m, name) {
  m[name] = name;
  return m;
}, {})
