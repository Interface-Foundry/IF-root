require('kip')
var request = require('request-promise')

var queue = require('../chat/components/queue-mongo')
const payURL = `https://pay.kipthis.com/`

/*

*/
function * sessionSuccesfullyPaid (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.order['completed_payment'] = true
  foodSession.save()
  queue.publish('outgoing.' + message.origin, 'thanks you have successfully paid', message._id + '.reply.results')
}

/* this would be for kip to pay for an order once the user has successfully paid stripe
*
*
*/
module.exports.payForItemFromKip = function * (session,guest_token) {
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/api/guest/cart/${session.merchant_id}/checkout`,
    'headers': {'Guest-Token': guest_token},
    'json': true,
    'body': session
  }

  console.log('SENDING TO DELIVERY NOW ',opts)

  // try {
  //   var response = yield request(opts)
  //   return response
  // } catch (e) {
  //   logging.error('couldnt submit payment uh oh')
  // }
}



// queue.topic('cafe.payments').subscribe(payment => {
//   logging.info('ack-ing payment', payment.data)

//   // if payment is successful create message for replyChannel or whatever
//   payment.ack()
// })

