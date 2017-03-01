require('../kip.js')
var _ = require('lodash')

/*
* create preferences for user
* @param {Number} - amt - amount of recommendations to return to user
*/
function * createPreferences (user, options, amnt, model, randomResults) {
  var items

  amnt = (amnt === undefined) ? 1 : amnt
  model = (model === undefined) ? 'unknown' : model

  if (randomResults) {
    items = yield randomSuggestion(user, options, model)
    logging.debug('using random suggestion for user, ', items)
  } else {
    logging.debug('using nothing for user for time being')
  }
  return items
}

/*
* returns random suggestion for user to use for model training later on. only
* returns one [item] for now since would need to know not to double pick
*/
function * randomSuggestion (user, options, model) {
  var sampledItem = _.sample(options)
  yield createItem(user.id, model, sampledItem, 'random')
  return [sampledItem]
}

/*
*
*
*/
function * createItem (user, modelName, itemName, training) {
  var item = new db.Preference({
    user_id: user,
    model_name: modelName,
    training: (training === undefined),
    random: (training === 'random'),
    item: itemName
  })

  yield item.save()
  return item
}

module.exports = {
  createPreferences: createPreferences,
  randomSuggestion: randomSuggestion
}
