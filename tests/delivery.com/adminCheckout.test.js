require('co-mocha')

var _ = require('lodash')
var expect = require('chai').expect
var testingHelpers = require('./testing_helpers.js')

require('../../src/kip.js')
require('../../src/logging.js')


// SET UP AND CONSTS

// var filePathToUse = testingHelpers.getFileWithModules(`generateAdminCheckout.js`, testingHelpers.DELIVERY_DIR)
// var generateAdminCheckout = require(filePathToUse).createCostAttachmentsForAdminCheckout
var generateAdminCheckout = testingHelpers.getFunctionFromModule(
  'createAttachmentsForAdminCheckout',
  'generateAdminCheckout.js',
  testingHelpers.DELIVERY_DIR
)


// TESTING
describe('testing creating admins checkout Attachments', () => {
  it('it should have 3 attachments or something', function * () {
    var mockFoodSession = testingHelpers.getMockData('mockFoodSession', 'mock.foodSession.js')
    expect(generateAdminCheckout(mockFoodSession, 100, feeDebug=true)).to.have.length(4)
  })
})
