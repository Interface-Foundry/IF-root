var async = require('async');
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var client = amazon.createClient({
  awsId: "AKIAILD2WZTCJPBMK66A",
  awsSecret: "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",
  awsTag: "kipsearch-20"
});

//pass in data, user chat history
//cartHistory = user cart items list
var outputCart = function(data,cartHistory,callback) {

    var cartItems = [];

    //async push items to cart
    async.eachSeries(cartHistory.cart, function(item, callback) {

        cartItems.push({
            ASIN: item.ASIN,
            Quantity: 1
        });

        callback();
    }, function done(){
        //only support "add to cart" message for one item.
        //static:
        buildAmazonCart(cartItems);
    });

    function buildAmazonCart(items){
        console.log('items ',items);

        //construct amazon cart format
        var options = {};
        for (var i = 0; i < items.length; i++) {
            var propASIN = 'Item.'+i+'.ASIN';
            options[propASIN] = items[i].ASIN;
            var propQuan = 'Item.'+i+'.Quantity';
            options[propQuan] = items[i].Quantity;
        }
        client.createCart(options).then(function(results) {
            data.client_res = results.PurchaseURL[0];
            callback(data);

        }).catch(function(err) {
            console.log(err);
            console.log(err.Error[0]);
            console.log('amazon err ', err[0].Error[0]);
        });
    }
};


/////////// tools /////////////



/// exports
module.exports.outputCart = outputCart;
