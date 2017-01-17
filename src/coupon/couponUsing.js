require('../kip.js')

// functions that get used when using coupons or after they have been used


/*
* get
* @param {string}
*
*/
function * getLatestFoodCoupon(team_id) {
  var coupon = yield db.Coupon.find({
    team_id: team_id,
    available: true
  }).sort({'time.created': -1}).limit(1).exec()
  coupon = coupon[0]
  return coupon
}

/*
* used in food.done after coupon has been applied to order
* @param {string}
*
*/
function * updateCouponForCafe(foodSession) {
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