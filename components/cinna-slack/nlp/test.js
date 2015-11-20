var request = require('request')

request({
  url: 'http://localhost:8083/reload'
})

request({
  url: 'http://localhost:8083/parse',
  method: 'POST',
  json: true,
  body: {
    text: 'I am a cat lover, are you?'
  }
}, function(e, r, b){
  if (e) { return console.log(e) }
  console.log(b)
})
