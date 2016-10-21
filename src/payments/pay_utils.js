require('kip')
var request = require('request-promise')

const payURL = `https://kipthis.com/charge`
const client_id = `ZTM0ZmNjOWRhNGMyNzkyYmI5NWVhMmM1ZmU2Njg3M2E3`



module.exports.payForFoodSession = function * (foodSessionID) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  // var adminsEmail = db.Chatusers
  var adminsEmail = 'hello@.com' // not sure where this is
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


module.exports.payForItem = function * (session) {
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/api/guest/cart/${session.chosen_restaurant.id}/checkout`,
    'headers': {'Guest-Token': session.guest_token},
    'json': true,
    'body': {
      // required
      'client_id': client_id,
      'order_type': session.fulfillment_method,
      'payments': [], // would be kip payment info
      'phone_number': session.chosen_location.phone_number,
      'first_name': session.chosen_location.first_name,
      'last_name': session.chosen_location.last_name,

      // optional
      'order_time': new Date().toISOString(), // Must be ISO8601 format
      'street': session.chosen_location.street,
      'city': session.chosen_location.city,
      'zip_code': session.chosen_location.zip_code,
      'instructions': session.data.instructions,
      'sms_notify': true, // Whether to send the customer an SMS when their order is confirmed by the merchant
      // 'uhau_id': int , // User Hear About Us ID. Please use this to associate the order to your account.
      'isOptingIn': false // Whether to allow delivery.com to send customer promotion and marketing emails
    }
  }
  try {
    var response = yield request(opts)
    return response
  } catch (e) {
    logging.error('couldnt submit payment uh oh')
  }
}

queue.topic('cafe.payments').subscribe(payment => {
  logging.info('ack-ing payment', payment.data)
  // if payment is successful create message for replyChannel or whatever
  payment.ack()
})

