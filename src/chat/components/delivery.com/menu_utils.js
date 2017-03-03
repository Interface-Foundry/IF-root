var request = require('request-promise');
var _ = require('lodash');

var config = require('../../../config')
var Menu = require('./Menu')

/**@constant {string} url for pop-out menu*/
var popoutUrl = config.menuURL + '/cafe';

/**@exports menu_utils*/
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

/**
* Calls the menu server to get a url for the kip popout menu
* @param foodSession
* @param user_id {string} the id of the user who will "own" the popout
* @param selected_items {array} array of any items the user has already selected (although not added to their cart)
* @returns {string} menu popout url
*/
utils.getUrl = function * (foodSession, user_id, selected_items) {
  if (!selected_items) selected_items = [];
  try {
    return yield request({
        url: popoutUrl,
        method: 'POST',
        json: {
          'rest_id': foodSession.chosen_restaurant.id,
          'team_id': foodSession.team_id,
          'delivery_ObjectId': foodSession._id,
          'budget': (foodSession.user_budgets[user_id] ? foodSession.user_budgets[user_id] : foodSession.budget),
          'user_id': user_id,
          'selected_items': selected_items
        }
    })
  } catch (err) {
    logging.error('ERROR in getURL', err)
    return err;
  }
}

/**
* Maps the cuisine-name to an emoji specific(ish) to it
* @param cuisine {string} cuisine name
* @returns {string} cuisine-specific emoji
*/
utils.cuisineEmoji = function (cuisine) {
    console.log('CUISINE', cuisine);
    var e
    switch(cuisine){
        case "Afghan":
            e = '🍛'
            break;
        case "American":
            e = '🍔'
            break;
        case "Argentinian":
            e = '🍛'
            break;
        case "Asian":
            e = '🍜'
            break;
        case "BBQ":
        case "Barbeque":
            e = '🔥'
            break;
        case "Bagels":
        case "Bagelry":
            e = '🗽'
            break;
        case "Bakery":
            e = '🍞'
            break;
        case "Bar Food":
            e = '🍺'
            break;
        case "Brazilian":
            e = '🍛'
            break;
        case "Breakfast":
            e = '🍳'
            break;
        case "Brunch":
            e = '🍳'
            break;
        case "Burgers":
            e = '🍔'
            break;
        case "Cafe":
            e = '☕'
            break;
        case "Caribbean":
            e = '🍛'
            break;
        case "Cheesesteaks":
            e = '🍔'
            break;
        case "Chicken":
            e = '🍗'
            break;
        case "Chinese":
            e = '🍲'
            break;
        case "Crepes":
            e = '🌯'
            break;
        case "Cuban":
            e = '🍛'
            break;
        case "Deli":
            e = '🍔'
            break;
        case "Desserts":
            e = '🍰'
            break;
        case "Diner":
            e = '☕'
            break;
        case "Empanadas":
            e = '🍘'
            break;
        case "Ethiopian":
            e = '🌯'
            break;
        case "Farm to Table":
            e = '🌱'
            break;
        case "Fast Food":
            e = '🍟'
            break;
        case "French":
            e = '🧀'
            break;
        case "Frozen Yogurt":
            e = '🍦'
            break;
        case "Fusion":
            e = '🍳'
            break;
        case "German":
            e = '🌭'
            break;
        case "Gluten-Free":
            e = '🌽'
            break;
        case "Greek":
            e = '🍋'
            break;
        case "Hawaiian":
            e = '🍍'
            break;
        case "Healthy":
            e = '🍏'
            break;
        case "Hot Dogs":
            e = '🌭'
            break;
        case "Ice Cream":
            e = '🍨'
            break;
        case "Indian":
            e = '🍛'
            break;
        case "Irish":
            e = '☘'
            break;
        case "Italian":
            e = '🍝'
            break;
        case "Japanese":
            e = '🍣'
            break;
        case "Juice Bar":
            e = '🍓'
            break;
        case "Korean":
            e = '🌶'
            break;
        case "Latin":
            e = '🌽'
            break;
        case "Mediterranean":
            e = '🍆'
            break;
        case "Mexican":
            e = '🌵'
            break;
        case "Middle Eastern":
            e = '🍆'
            break;
        case "Moroccan":
            e = '🍋'
            break;
        case "Peruvian":
            e = '🍳'
            break;
        case "Pizza":
            e = '🍕'
            break;
        case "Polish":
            e = '🍲'
            break;
        case "Russian":
            e = '🍲'
            break;
        case "Salads":
            e = '🌱'
            break;
        case "Sandwiches":
            e = '🌯'
            break;
        case "Seafood":
            e = '🦀'
            break;
        case "Soul Food":
            e = '🍳'
            break;
        case "Soups":
            e = '🍲'
            break;
        case "South American":
            e = '🌽'
            break;
        case "Spanish":
            e = '🍅'
            break;
        case "Steak":
            e = '🍖'
            break;
        case "Sushi":
            e = '🍣'
            break;
        case "Tapas":
            e = '🍤'
            break;
        case "Tex-Mex":
            e = '🌮'
            break;
        case "Thai":
            e = '🌶'
            break;
        case "Turkish":
            e = '🍢'
            break;
        case "Vegan":
            e = '🌱'
            break;
        case "Vegetarian":
            e = '🌱'
            break;
        case "Vietnamese":
            e = '🍜'
            break;
        case "Wings":
            e = '🍗'
            break;
        default:
            e = '🍳'
    }
    return e
}

module.exports = utils;
