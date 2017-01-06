var _ = require('lodash')

/*
* @params {Object} foodSession
* @params {Number} totalPrice
* @returns {Array} the attachments that are money related for admin to checkout
*/
module.exports.createAttachmentsForAdminCheckout = function (foodSession, totalPrice, feeDebug=false) {
  // change this to 0 to not print fees unless they exist
  var feeDebuging = feeDebug ? -1.0: 0.00


  var tipText = (foodSession.tip.percent === 'cash') ? `Will tip in cash` : `${foodSession.tip.amount.$}`
  var tipAttachment = {
    'title': `Tip: ${tipText}`,
    'fallback': `Tip: ${tipText}`,
    'callback_id': 'food.admin.cart.tip',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'mrkdwn_in': ['text'],
    'actions': [`15%`, `20%`, `25%`, `Cash`].map((t) => {
      var baseTipButton = (foodSession.tip.percent.toLowerCase() === t.toLowerCase()) ? `◉ ${t}` : `◎ ${t}`
      return {
        'name': 'food.admin.cart.tip',
        'text': baseTipButton,
        'type': `button`,
        'value': t.toLowerCase()
      }
    })
  }

  var deliveryDiscount = (_.get(foodSession, 'order.discount_percent') > feeDebuging) ?
    `_Included ${foodSession.order.discount_percent * 100}% discount from delivery.com_` : ``

  // possible to have other fees, docs say this may include convenience and
  //  delivery fee and whatever else but from experience this seems to be false
  var orderFees = foodSession.order.fees.reduce((a, b) => a + b.value, 0)
  var feeFromDeliveryLines = ``
  feeFromDeliveryLines += foodSession.order.convenience_fee > feeDebuging ?
    `*Convenience Fee:* ${foodSession.order.convenience_fee.$}\n` : ``
  feeFromDeliveryLines += foodSession.order.delivery_fee > feeDebuging ?
    `*Delivery Fee:* ${foodSession.order.delivery_fee.$}\n` : ``

  var extraFeesFromDelivery = orderFees > feeDebuging ?
    `*Other Delivery.com Fees: * ${orderFees.$}\n` : ``

  var deliveryCostsAttachment = {
    fallback: 'Delivery.com Total ',
    text: `*Cart Subtotal:* ${foodSession.order.subtotal.$}\n` +
          `*Taxes:* ${foodSession.order.tax.$}\n` +
          feeFromDeliveryLines +
          `*Delivery.com Total:* ${foodSession.order.total.$}\n` +
          extraFeesFromDelivery +
          deliveryDiscount,
    'callback_id': 'food.admin.cart.info',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'mrkdwn_in': ['text']
  }

  // costs that kip calculates and instructions
  var instructionText = _.get(foodSession, 'instructions') ?
        `*Delivery Instructions*: _${foodSession.instructions}_\n` : ``

  var kipCoupon = foodSession.discount_amount > feeDebuging ? `*Kip Coupon:* -${foodSession.discount_amount.$}\n` : ``
  var kipCostsAttachment = {
    fallback: 'Tip + Kip Fees + Discounts',
    text: `*Tip:* ${tipText}\n` +
          `*Kip Fee:* ${foodSession.service_fee.$}\n` +
          kipCoupon +
          instructionText,
    callback_id: 'food.admin.cart.info',
    color: '#3AA3E3',
    attachment_type: 'default',
    mrkdwn_in: ['text']
  }


  // ----- calculated amount is order.total + tip + service_fee - discount_amount
  var checkoutAttachment = {
    fallback: `*Order Total:* ${foodSession.calculated_amount.$}`,
    text: `*Order Total:* ${foodSession.calculated_amount.$}`,
    callback_id: 'admin_order_confirm',
    color: '#49d63a',
    attachment_type: 'default',
    mrkdwn_in: ['text'],
    footer: 'Powered by Delivery.com',
    footer_icon: 'http://tidepools.co/kip/dcom_footer.png'
  }


  if (totalPrice < foodSession.chosen_restaurant.minimum) {
    checkoutAttachment.text += `\n*Minimum Not Yet Met:* Minimum Order For Restaurant is: *` +
                               `_\$${foodSession.chosen_restaurant.minimum}_*`
    } else {
      checkoutAttachment.actions = [{
        'name': `food.admin.order.checkout.confirm`,
        'text': `✓ Checkout ${foodSession.calculated_amount.$}`,
        'type': `button`,
        'style': `primary`,
        'value': `checkout`
      }, {
        // instructions button
        name: 'food.order.instructions',
        text: '✎ Add Instructions',
        type: 'button',
        value: ''
      }]
    }

  return [].concat(tipAttachment, deliveryCostsAttachment, kipCostsAttachment, checkoutAttachment)
}
