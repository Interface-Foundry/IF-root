'use strict'
const vision = require('node-cloud-vision-api')

// init with auth
vision.init({auth: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

// construct parameters
const req = new vision.Request({
  image: new vision.Image('./jacket1.jpg'),
  features: [
    // new vision.Feature('FACE_DETECTION', 1),
     new vision.Feature('LOGO_DETECTION', 200)
    // new vision.Feature('TEXT_DETECTION', 4),
    // new vision.Feature('LABEL_DETECTION', 100)
  ]
})

// send single request
vision.annotate(req).then((res) => {
  // handling response
  console.log(JSON.stringify(res.responses))
}, (e) => {
  console.log('Error: ', e)
})