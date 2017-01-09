require('../kip.js')
// create and validate mongoose
var uuid = require('uuid')
var _ = require('lodash')
var couponHelpers = require('./coupon_helpers.js')


/*
* create a coupon for a team_id that can be used multiple times
*/
function * createNewMultiUseCoupon(team_id, couponType, couponAmount, uses, couponCode=false, promotion=false) {
  var coupon = new db.Coupon(_.omitBy({
    'team_id': team_id,
    'coupon_code': couponCode ? couponCode : uuid.v4(),
    'quantity_coupon.can_be_used': uses,
    'coupon_discount': couponAmount,
    'coupon_type': couponType,
    'promotion': promotion ? promotion : undefined
  }, _.isUndefined))
  yield coupon.save()
}

/*
* same as above but
*/
function * createNewSingleUseCoupon(team_id, couponType, couponAmount, uses, couponCode=false, promotion=false) {
  var coupon = new db.Coupon(_.omitBy({
    'team_id': team_id,
    'coupon_code': couponCode ? couponCode : uuid.v4(),
    'coupon_discount': couponAmount,
    'coupon_type': couponType,
    'promotion': promotion ? promotion : undefined
  }, _.isUndefined))
  yield coupon.save()
}

/*
*
*/
function * checkTeamFor10PercentOffFirstOrder(team_id) {
  var teamsCoupons = yield db.Coupon.findOne({team_id: team_id, coupon_code: '10PercentOffFor5Uses'})
  if (!teamsCoupons) {
    logging.info(`creating coupon for team_id:${team_id} as they havent dont this before`)
    yield couponHelpers.createNewMultiUseCoupon(team_id, 'percentage', 10, 5, '10PercentOffFor5Uses', 'first 5 uses get 10 percent off')
  } else {
    logging.info(`team_id:${team_id} already had 10% off for 5 first orders coupon added`)
  }
}

function * refreshAllTeamCoupons(team_id) {
  yield checkTeamFor10PercentOffFirstOrder(team_id)
}



module.exports = {
  refreshAllTeamsCoupons: refreshAllTeamsCoupons
}



// co(function * () {
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, '50PercentOffFor5Uses')
    // yield db.Coupon.findOne({team_id: '12345team', coupon_code: '50PercentOffFor5Uses'})
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, 'Percentofffor')
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, 'Percentofffor', 'promotion')
    // db.connection.close()
    // var result = _.omitBy(my_object, _.isNil);
// })