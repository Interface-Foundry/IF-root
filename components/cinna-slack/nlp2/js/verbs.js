var debug = require('debug')('nlp')

var checkout = ['get', 'checkout']
var remove = ['remove', 'delete', 'cancel']
var list = ['view', 'show', 'list']
var save = ['save', 'buy', 'add']
var focus = ['focus', 'info']
var search = ['need', 'want']

var purchase = checkout.concat(remove).concat(list).concat(save);
var search = focus;

module.exports.getAction = function(v) {
  debug('getting action for ' + v)
  // v = v.toLowerCase();
  v = v.toString().toLowerCase();
  if (search.indexOf(v) >= 0) {
    return 'initial'
  }
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

module.exports.getMode = function(v) {
  v = v.toString().toLowerCase();
  // v = v.toLowerCase();
  if (purchase.indexOf(v) >= 0) {
    return 'cart'
  } else if (search.indexOf(v) >= 0) {
    return 'shopping'
  }
}
