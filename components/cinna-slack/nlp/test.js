var request = require('request')

request({
  url: 'http://localhost:8083/reload'
})

request({
  url: 'http://localhost:8083/parse',
  method: 'POST',
  json: true,
  body: {
    text: 'shorts in San Francisco'
  }
}, function(e, r, b){
  if (e) { return console.log(e) }
  console.log(b)
  console.log(b.ss)
})
