var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Message = db.Message;
var config = require('config');

// # Ghost Startup
// Orchestrates the startup of Ghost when run from command line.
var express,
    ghost,
    parentApp,
    errors;

// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

// Proceed with startup
express = require('express');
ghost = require('./core');
errors = require('./core/server/errors');

// Create our parent express app instance.
parentApp = express();

var querystring = require('querystring');
parentApp.get('/product/*', function(req, res, next) {
  	//example:
  	//localhost:9901/product/http:%2F%2Fwww.amazon.com%2FMilitary-Shockproof-Waterproof-Wireless-Bluetooth%2Fdp%2FB0192UXR4Y%253Fpsc%253D1%2526SubscriptionId%253DAKIAILD2WZTCJPBMK66A%2526tag%253Dbubboorev-20%2526linkCode%253Dxm2%2526camp%253D2025%2526creative%253D165953%2526creativeASIN%253DB0192UXR4Y/id/554zd_1Db01x/pid/ABZGQ5

	var processReq = querystring.unescape(req.url); //magic cinna moment ✨

  //we have a newly generated link
  if(processReq.indexOf('/pid/') > -1){
    var productId = processReq.split('/pid/')[1];
    processReq = processReq.split('/pid/')[0];
    var userId = processReq.split('/id/')[1];
    var url = processReq.split('/id/')[0].replace('/product/','');
    saveClick(productId,userId,url,req); //store click to user id
    //redirect 
    res.redirect(url); //magic cinna moment ✨ 
  }
  //backup for old links
  else {
    res.redirect(req.url.replace('/product/','')); //magic cinna moment ✨ 
  }

   //querystring.unescape(req.url.replace('/product/',''))
});

// Call Ghost to get an instance of GhostServer
ghost().then(function (ghostServer) {
    // Mount our Ghost instance on our desired subdirectory path if it exists.
    parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);

    // Let Ghost handle starting our server instance.
    ghostServer.start(parentApp);
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});

function saveClick(productId,userId,url,req){

  var processId = userId.split('_');

  var IP;

  if(req.headers['x-forwarded-for']){
    IP = req.headers['x-forwarded-for'];
  }else if (req.connection.remoteAddress){
    IP = req.connection.remoteAddress;
  }else {
    IP = 'missing';
  }

  var data = {
    source: {
      id: userId,
      origin: 'kip',
      org: processId[0],
      channel: processId[1]
    },
    bucket:'metrics',
    action:'click',
    click: {
      productId: productId,
      url: url,
      IP: IP,
      headers:JSON.stringify(req.headers['user-agent'])
    }
  };
  data = new Message(data);
  data.save(function(err, data){
      if(err){
          console.log('Mongo err ',err);
      }
      else{
          //console.log('click saved');
      }
  }); 
}		
          
