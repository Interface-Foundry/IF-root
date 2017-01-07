var db = require('../kip.js')
// create and validate mongoose
var uuid = require('uuid')
var _ = require('lodash')
var co = require('co')


// maybe add expiration and stuff idk, probably need to
function * createNewMultiUseCoupon(team, couponType, couponAmount, uses, couponCode=false, promotion=false) {
  var coupon = new db.Coupon(_.omitBy({
    team_id: team,
    coupon_code: couponCode ? couponCode : uuid.v4(),
    quanitity_coupon_can_be_used: uses,
    coupon_discount: couponAmount,
    coupon_type: couponType,
    promotion: promotion ? promotion : undefined
  }, _.isUndefined))
  yield coupon.save()
}

function * checkTeamFor50OffFirstOrder(team) {
  var teamsCoupons = yield db.Coupon.findOne({team_id: team, coupon_code: '50PercentOffFor5Uses'})
  if (!teamsCoupons) {
    logging.info('creating coupon for team as they havent dont this before')
    yield createNewMultiUseCoupon(team, 'percentage', 50, 5, 50, 'PercentOffFor5Uses', 'first 5 uses get 50 percent off')
  }
}


// co(function * () {
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, '50PercentOffFor5Uses')
    // yield db.Coupon.findOne({team_id: '12345team', coupon_code: '50PercentOffFor5Uses'})
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, 'Percentofffor')
    // yield createNewMultiUseCoupon('12345team', 'percentage', 50, 5, 'Percentofffor', 'promotion')
    // db.connection.close()
    // var result = _.omitBy(my_object, _.isNil);
// })