
var checkout = ['get', 'checkout', 'buy']
var remove = ['remove', 'delete', 'cancel']
var list = ['view', 'show', 'list']
var save = ['save']

var all = checkout.concat(remove).concat(list).concat(save);

module.exports.getAction = function(v) {
  v = v.toLowerCase();
  if (v === 'save') {
    return v
  }
  if (checkout.indexOf(v) >=0) {
    return 'checkout'
  }
  if (remove.indexOf(v) >= 0) {
    return 'remove'
  }
  if (list.indexOf(v) >= 0) {
    return 'list';
  }
}

module.exports.getBucket = function(v) {
  v = v.toLowerCase();
  if (all.indexOf(v) >= 0) {
    return 'purchase'
  }
}
