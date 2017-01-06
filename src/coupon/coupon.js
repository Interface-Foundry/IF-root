// create and validate mongoose
var uuid = require('uuid')

// maybe add expiration and stuff idk
function * createNewMultiUseCoupon(team, type, amount, uses, code=false, promotion=false) {
  var coupon = new db.Coupon({
    coupon_code: code ? code : uuid.v4(),
    quanitity_coupon_can_be_used: uses,
    coupon_type: type,
    team_id: team
  })

  if (promotion) {
    coupon.promotion = promotion
  }
}

function checkTeamFor50OffFirstOrder(team) {
  var teamsCoupons = yield db.Coupon.findOne({team_id: team, coupon_code: '50PercentOffFor5Uses'})
  if teamsCoupons.length
  yield
}
