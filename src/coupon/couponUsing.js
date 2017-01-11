// require('../kip.js')

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
  }).sort('-time.created').limit(1).exec()
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

    // update some qualities since using findoneandupdate idk
    coupon.time.used = Date.now()
    coupon.quanitity_coupon.used++
    coupon.coupon_order.push({
      order_amount: foodSession.order.total,
      user_id: foodSession.convo_initiater.id,
      foodsession_id: foodSession._id
    })
    yield coupon.save()
  } catch (err) {
    logging.error(`error, no coupon found but coupon used in db`, foodSession)
  }
}


module.exports = {
  getLatestFoodCoupon: getLatestFoodCoupon,
  updateCouponForCafe: updateCouponForCafe
}