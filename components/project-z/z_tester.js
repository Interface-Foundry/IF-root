var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Message = db.Message;
var config = require('config');

var express = require('express');
var app = express();

var querystring = require('querystring');


app.get('/product/*', function(req, res) {

  var processReq = querystring.unescape(req.url); //magic cinna moment ✨
  var productId = processReq.split('/pid/')[1];
  processReq = processReq.split('/pid/')[0];
  var userId = processReq.split('/id/')[1];
  var url = processReq.split('/id/')[0].replace('/product/','');
  saveClick(productId,userId,url);


  //DO REDIRECT HERE

})

function saveClick(productId,userId,url){
  var data = {
    source: {
      id: userId,
      org: 'kip'
    },
    bucket:'metrics',
    action:'click',
    click: {
      productId: productId,
      url: url
    }

  };
  data = new Message(data);
  data.save(function(err, data){
      if(err){
          console.log('Mongo err ',err);
      }
      else{
          console.log('mongo res ',data);
      }
  }); 
}
		

app.listen(9901, function() {
    console.log('app listening on port 9901');
})
          
        
