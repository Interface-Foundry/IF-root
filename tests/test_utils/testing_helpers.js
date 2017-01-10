var path = require('path')

module.exports.PROJECT_DIR = PROJECT_DIR = 'IF-root'


var baseDir = function () {
  // dumb function to get the absolute directory for testing purposes from
  // multiple folder levels
  var baseRoot = path.parse(__dirname).root
  var splitBase =  (__dirname).split(path.sep)
  var baseRelative = splitBase.indexOf(PROJECT_DIR)
  var baseAbsolute = path.join(baseRoot, path.join.apply(null, splitBase.slice(0, baseRelative + 1)))
  return baseAbsolute
}()

// constants
module.exports.DELIVERY_DIR = DELIVERY_DIR = path.join(baseDir, 'src/chat/components/delivery.com')
module.exports.COUPON_DIR = DELIVERY_DIR = path.join(baseDir, 'src/coupon')
module.exports.TESTING_DIR = TESTING_DIR = path.join(baseDir, 'tests/mock_data')


// test module
function getModule(filename, filenameDir) {
  var filePathFromBase = path.join(filenameDir, filename)
  var fileRelativePath = path.relative(__dirname, filePathFromBase)
  return fileRelativePath
}

// get a single function to test from a filename/module and location of that
// filenameDir from root
function getFunctionFromModule(functionName, filename, filenameDir) {
  var modulePath = getModule(filename, filenameDir)
  var moduleToUse = require(modulePath)
  return moduleToUse[functionName]
}

function getMockDataModule(filename) {
  var mockDataPathFromBase = path.join(TESTING_DIR, filename)
  var mockDataRelativePath = path.relative(__dirname, mockDataPathFromBase)
  return mockDataRelativePath
}

// get mock data with varName
function getMockData(varName, filename) {
  var mockData = require(getMockDataModule(filename))
  return mockData[varName]
}

module.exports = {
  getModule: getModule,
  getFunctionFromModule: getFunctionFromModule,
  getMockDataModule:  getMockDataModule,
  getMockData: getMockData
}