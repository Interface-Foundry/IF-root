/*eslint-env es6*/
var amazon = require('../amazon-product-api_modified');
var co = require('co');
var fs = require('fs');

var client = amazon.createClient({
  awsId: "AKIAIYTURL6C5PID2GZA",
  awsSecret: "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",
  awsTag: "krista08-20"
});

/*
"URLEncodedHMAC" : [
			"V2yQb98P0ShwB2tcCbU%2BncRIPeE%3D"
		],
		"HMAC" : [
			"V2yQb98P0ShwB2tcCbU+ncRIPeE="
		],
		"CartId" : [

*/

var cart1 = {
  CartId: '186-6856720-4045104',
  HMAC: 'S44wkoh+aTaw88WAP44Qfq+GlCs='
};

co(function*() {
  var cart = yield client.getCart(cart1)

  fs.writeFileSync(__dirname + '/cart3.json', JSON.stringify(cart, null, 2));
  console.log(cart);
}).catch(e => {
  console.log(e);
})
