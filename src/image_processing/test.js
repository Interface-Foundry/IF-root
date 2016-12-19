var fs = require('mz/fs')
var co = require('co')
var path = require('path')
var request = require('request-promise')
var config = require('../config')
var exec = require('child_process').exec


co(function * () {
  var json = yield fs.readFile(path.join(__dirname, 'pictest.json'), 'utf8')
  var body = JSON.parse(json)
  var realImage = yield request({
     uri: config.picstitchDelivery,
     json: true,
     body: body
  })

  console.log(realImage)
  exec(`xdg-open "${realImage}"`)

}).catch(console.error.bind(console))
