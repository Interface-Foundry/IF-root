require('kip')
var request = require('request-promise')

const payURL = `https://pay.kipthis.com/`

var UserChannel = require('../chat/components/delivery.com/UserChannel')
var queue = require('../chat/components/queue-mongo')
var replyChannel = new UserChannel(queue)

/*
*
*/
module.exports.sessionSuccesfullyPaid = function * (foodSession) {
  // var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var lastMessageByUser = yield db.Messages.find({user_id: foodSession.order.convo_initiater.id, incoming: true}).sort({ts: -1}).limit(1).exec()
  lastMessageByUser = lastMessageByUser[0]
  foodSession.order['completed_payment'] = true
  foodSession.save()
  replyChannel.send(lastMessageByUser, 'food.done', {type: 'slack', data: {text: 'thanks, order successfully paid and submitted'}})
}

/* this would be for kip to pay for an order once the user has successfully paid stripe
*
*
*/
module.exports.payForItemFromKip = function * (session, guestToken) {
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/api/guest/cart/${session.merchant_id}/checkout`,
    'headers': {'Guest-Token': guestToken},
    'json': true,
    'body': session
  }

  console.log('SENDING TO DELIVERY NOW ', JSON.stringify(opts))

  if (process.env.NODE_ENV == 'development_alyx') {
    return true
  }else {
    
    try {
      var response = yield request(opts)
      return response
    } catch (e) {
      response = null
      logging.error('couldnt submit payment uh oh ',JSON.stringify(e))
      return null
    }
  }

}

// queue.topic('cafe.payments').subscribe(payment => {
//   logging.info('ack-ing payment', payment.data)

//   // if payment is successful create message for replyChannel or whatever
//   payment.ack()
// })

