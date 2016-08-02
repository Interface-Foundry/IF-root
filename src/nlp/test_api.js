var request = require('request-json')
var client = request.createClient('http://chat.kipapp.co:6000')

client.post('/', { text: 'i need a 3d camera' }, function(e, r, b) {
  console.log(e);
  // console.log(r);
  console.log(b);
})
