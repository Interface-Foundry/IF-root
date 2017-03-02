var Vision = require('google-cloud').vision
var request = require('request-promise')
var fs = require('fs')
var uuid = require('uuid')

var vision = Vision({key: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

var googl = require('goo.gl')
if (process.env.NODE_ENV === 'development') {
  googl.setKey('AIzaSyCKGwgQNKQamepKkpjgb20JcMBW_v2xKes')
} else {
  googl.setKey('AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk')
}

/*
*
*
*/
function * getLabels (image) {
  var results = yield vision.detectLabels(image)
  return results
}

/*
*
*
*/
function * getText (image) {
  var options = { verbose: true }
  var results = yield vision.detectText(image, options)
  return results
}

function * getImage (url, botToken) {
  // get image if its on slack
  var savePath = `${__dirname}/tmp_img/${uuid.v4()}.${url.split('.').pop().split(/\/|\?|\\|\#/g)[0]}`

  var options = {
    uri: url,
    encoding: 'binary',
    method: 'GET'
  }
  if (url.indexOf('.slack.com') > 0) {
    options.followRedirect = true
    options.headers = {'Authorization': `Bearer ${botToken}`}
  }
  var results = yield request(options)

  fs.writeFileSync(savePath, results, 'binary')
  return savePath
}

function * getImageAnnotations (url, botToken) {
  var filename = yield getImage(url, botToken)
  var info = yield getText(filename)
  fs.unlinkSync(filename)
  return info
}

if (!module.parent) {
  var co = require('co')
  var botToken = 'xoxb-99860262946-2wIygApEYIrxYR1bWJwkEsNJ'
  co(function * () {
    var img = `https://files.slack.com/files-pri/T167QHT5M-F4C7G3USC/clothes.jpeg`
    // var i = yield visionImage(img, botToken)
    // var i = yield getText('./tmp_img/logos.png')
    // console.log(i)
  })
  var opts = {verbose: true}
  vision.detectText('./tmp_img/wakeupcat.jpg', opts, function (err, detections) {
    if (err) {
      console.log('error')
    }
    console.log(detections)
  })
}
