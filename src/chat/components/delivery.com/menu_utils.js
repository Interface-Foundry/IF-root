var rp = require('request-promise');
var _ = require('lodash');

var Menu = require('./Menu')

var popoutUrl = 'http://6945acc9.ngrok.io/cafe';

var utils = {};

utils.sortMenu = function (foodSession, user, matchingItems) {
  var previouslyOrderedItemIds = _.get(user, 'history.orders', [])
    .filter(order => _.get(order, 'chosen_restaurant.id') === _.get(foodSession, 'chosen_restaurant.id', 'not undefined'))
    .reduce((allIds, order) => {
      allIds.push(order.deliveryItem.id)
      return allIds
    }, [])

  recommendedItemIds = _.keys(_.get(foodSession, 'chosen_restaurant_full.summary.recommended_items', {}))
  recommendedItemIds = recommendedItemIds.map(i => Number(i))

  var sortOrder = {
    searched: 6,
    orderedBefore: 5,
    recommended: 4,
    none: 3,
    indifferent: 2,
    last: 1
  }

  var lastItems = ['beverage', 'beverages', 'desserts', 'dessert', 'cold appetizer', 'hot appetizer', 'appetizers', 'appetizers from the kitchen', 'soup', 'soups', 'drinks', 'salads', 'side salads', 'side menu', 'bagged snacks', 'snacks']

  var menu = Menu(foodSession.menu)
  var sortedMenu = menu.allItems().map(i => {
    // inject the sort order stuff
    if (matchingItems.includes(i.id)) {
      i.sortOrder = sortOrder.searched + matchingItems.length - matchingItems.findIndex(x => { return x === i.id })
      // i.infoLine = 'Returned from search term'
    } else if (previouslyOrderedItemIds.includes(i.id)) {
      i.sortOrder = sortOrder.orderedBefore
      i.infoLine = 'You ordered this before'
    } else if (recommendedItemIds.includes(Number(i.unique_id))) {
      i.sortOrder = sortOrder.recommended
      i.infoLine = 'Popular Item'
    } else if (_.includes(lastItems, menu.flattenedMenu[String(i.parentId)].name.toLowerCase())) {
      i.sortOrder = sortOrder.last
    } else {
      i.sortOrder = sortOrder.none
    }

    return i
  }).sort((a, b) => b.sortOrder - a.sortOrder)

  return sortedMenu
}

utils.getUrl = function (rest_id, team_id, delivery_ObjectId, user_id) {
  return rp({
    url: popoutUrl,
    method: 'POST',
    json: {
      rest_id: rest_id,
      team_id: team_id,
      delivery_ObjectId: delivery_ObjectId,
      user_id: user_id
    }
  })
  .then(function (res) {
    return res;
  })
  .catch(function (err) {
    kip.debug('ERROR', err)
  })
  return url;
}

module.exports = utils;
