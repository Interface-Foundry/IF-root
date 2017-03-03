require('../kip.js')

/**
* @file functions that get used when using coupons or after they have been used
*/

/**
 * get latest coupon for a team
 * @param {string} team_id - team_id to look up coupon for
 * @return {object} coupon - latest coupon object that is available
 */
function * getLatestFoodCoupon (team_id) {
  var coupon = yield db.Coupon.find({
    team_id: team_id,
    available: true
  }).sort({'time.created': -1}).limit(1).exec()
  coupon = coupon[0]
  return coupon
}

/**
 * update coupon object that is used in a foodSession order.  used in handlers['food.done'] after coupon has been applied to order
 * @param {object} foodSession - foodSession to use that included a coupon
 */
function * updateCouponForCafe (foodSession) {
  try {
    var coupon = yield db.Coupon.findOne({
      team_id: foodSession.team_id,
      coupon_code: foodSession.coupon.code,
      available: true
    }).exec()
  } catch (err) {
    logging.error('no coupon found but coupon used in order')
    return
  }
  try {
    // update some qualities since using findoneandupdate idk
    coupon.quantity_coupon.used += 1
    coupon.time.used = Date.now()
    coupon.coupon_order.push({
      order_amount: foodSession.order.total,
      user_id: foodSession.convo_initiater.id,
      foodsession_id: foodSession._id // change this later
    })
    logging.info('saving coupon')
    yield coupon.save()
  } catch (err) {
    logging.error('error, while saving coupon in db')
    return
  }
}

module.exports = {
  getLatestFoodCoupon: getLatestFoodCoupon,
  updateCouponForCafe: updateCouponForCafe
}