require('kip')
var request = require('request-promise')

const payURL = `https://kipthis.com/`

module.exports.payForFoodSession = function * (foodSession) {
  // var adminsEmail = db.Chatusers
  var adminsEmail = 'tmp_email@gmail.com' // not sure where this is
  try {
    var response = yield request({
      uri: payURL,
      method: `POST`,
      json: true,
      body: {
        'amount': foodSession.order.total,
        'kipId': `slack_${foodSession.team_id}_${foodSession.convo_initiater.id}`,
        'description': `${foodSession.chosen_restaurant.id}`,
        'email': `${adminsEmail}`
      }
    })
    return response
  } catch (e) {
    logging.error('error doing kip pay lol', e)
  }
}
