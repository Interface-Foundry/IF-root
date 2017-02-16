require('../kip.js')

function preferences (user, options, amnt) {
  amnt = (amnt === undefined) ? 1 : amnt
  return []
}


/*
* returns random suggestion for user to use for model training later on
*
*/
function * randomSuggestion (user, options, model) {
  var sampledItem = _.sample(options)
  var item = yield createItem(user.id, model, training, sampledItem)
  return item
}


function * createItem(user, model_name, item_name, training) {
  training = (training === undefined) ? false : training
  var item = new db.Preference({
    user_id: user,
    model_name: model_name,
    training: training,
    item: item
  })
}
module.exports = {
  preferences: preferences
}
