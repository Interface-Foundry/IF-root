var uuid = require('uuid')
var _ = require('lodash')

/**
* @file Functions that allow creation and maintenance of coupons
*/

/**
 * create a coupon for a team_id that can be used multiple times
 * @param {object} team_id - the team_id to create coupon for
 * @param {string} couponType - amount_off or percentage
 * @param {number} couponAmount - the percentage
 * @param {number} uses - amount of uses for multi use
 * @param {string} [couponCode] - string that associates the coupon
 * @param {string} [promotion] - string that associates the coupon
 * @returns {array} the attachments that are money related for admin to checkout
 */
function * createNewMultiUseCoupon (team_id, couponType, couponAmount, uses, couponCode = false, promotion = false) {
  var coupon = new db.Coupons(_.omitBy({
    'team_id': team_id,
    'coupon_code': couponCode ? couponCode : uuid.v4(),
    'quantity_coupon.can_be_used': uses,
    'coupon_discount': couponAmount,
    'coupon_type': couponType,
    'promotion': promotion ? promotion : undefined
  }, _.isUndefined))
  yield coupon.save()
}

/**
 * create a coupon for a team_id that can be used single time
 * @param {object} team_id - the team_id to create coupon for
 * @param {string} couponType - amount_off or percentage
 * @param {number} couponAmount - the percentage
 * @param {string} [couponCode] - string that associates the coupon
 * @param {string} [promotion] - string that associates the coupon
 * @returns {array} the attachments that are money related for admin to checkout
 */
function * createNewSingleUseCoupon (team_id, couponType, couponAmount, couponCode = false, promotion = false) {
  var coupon = new db.Coupons(_.omitBy({
    'team_id': team_id,
    'coupon_code': couponCode ? couponCode : uuid.v4(),
    'coupon_discount': couponAmount,
    'coupon_type': couponType,
    'promotion': promotion ? promotion : undefined
  }, _.isUndefined))
  yield coupon.save()
}

/**
 * check if team has gotten a coupon to use that allows them 10% off 5 purchases on cafe
 * @param {object} team_id - team_id to check
 */
function * checkTeamFor10PercentOffFirstOrder (team_id) {
  const couponCode = '10PercentOffFor5Uses'
  var teamsCoupons = yield db.Coupon.findOne({team_id: team_id, coupon_code: couponCode})
  if (!teamsCoupons) {
    logging.info(`creating coupon for team_id:${team_id} as they havent dont this before`)
    yield createNewMultiUseCoupon(team_id, 'percentage', 0.10, 5, couponCode, 'first 5 uses get 10% off')
  } else {
    logging.info(`team_id:${team_id} already had 10% off for 5 first orders coupon added`)
  }
}

/**
 * this function would theoretically be for various/peripheral cleanup/maintenance tasks related to coupons
 * @param {object} team_id - team_id to check
 */
function * refreshTeamCoupons (team_id) {
  yield checkTeamFor10PercentOffFirstOrder(team_id)
}

module.exports = {
  createNewMultiUseCoupon: createNewMultiUseCoupon,
  createNewSingleUseCoupon: createNewSingleUseCoupon,
  refreshTeamCoupons: refreshTeamCoupons
}
