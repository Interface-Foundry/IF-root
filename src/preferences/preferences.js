require('../kip.js')
var _ = require('lodash')

/*
* create preferences for user
*
*/
function createPreferences (user, options, amnt) {
  amnt = (amnt === undefined) ? 1 : amnt
  return []
}

/*
* returns random suggestion for user to use for model training later on
*
*/
function * randomSuggestion (user, options, model) {
  var sampledItem = _.sample(options)
  var item = yield createItem(user.id, model, sampledItem, false)
  return item
}

/*
*
*
*/
function * createItem (user, modelName, itemName, training) {
  training = (training === undefined) ? false : training
  var item = new db.Preference({
    user_id: user,
    model_name: modelName,
    training: training,
    item: itemName
  })

  yield item.save()
  return item
}

module.exports = {
  createPreferences: createPreferences,
  randomSuggestion: randomSuggestion
}
