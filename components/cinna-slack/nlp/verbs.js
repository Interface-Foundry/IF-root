
var checkout = ['get', 'checkout', 'buy']
var remove = ['remove', 'delete', 'cancel']
var list = ['view', 'show', 'list']
var save = ['save']
var focus = ['focus', 'info']

var purchase = checkout.concat(remove).concat(list).concat(save);
var search = focus;

module.exports.getAction = function(v) {
  v = v.toLowerCase();
  if (save.indexOf(v) >= 0) {
    return 'save'
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
  if (focus.indexOf(v) >=0) {
    return 'focus';
  }
}

module.exports.getBucket = function(v) {
  v = v.toLowerCase();
  if (purchase.indexOf(v) >= 0) {
    return 'purchase'
  } else if (search.indexOf(v) >= 0) {
    return 'search'
  }
}
