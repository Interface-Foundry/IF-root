var request = require('request')

request({
  url: 'http://localhost:8083/reload'
})

request({
  url: 'http://localhost:8083/parse',
  method: 'POST',
  json: true,
  body: {
    text: 'i like the first one'
  }
}, function(e, r, b){
  if (e) { return console.log(e) }
  console.log(b)
  console.log(b.ss)
})
