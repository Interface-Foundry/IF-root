//Kip stuff
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/foundry');
var querystring = require('querystring');

var Click = mongoose.model('Click',{
	source: {
		id: String,
		org: String,
		channel: String
	},
	click: {
		productId: String,
		url: String,
		IP: String,
		headers: String
	},
	click_ts: Date
});

// var Click = mongoose.model('Click', clickSchema);


// # Ghost Startup
// Orchestrates the startup of Ghost when run from command line.

var ghost = require('./core'),
    express = require('express'),
    errors = require('./core/server/errors'),
    parentApp = express();

var bodyParser = require('body-parser')

parentApp.use(bodyParser.json())

// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

//kip stuff
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
    res.redirect(querystring.unescape(req.url.replace('/product/',''))); //magic cinna moment ✨
  }

   //querystring.unescape(req.url.replace('/product/',''))
});

ghost().then(function (ghostServer) {
    // Mount our Ghost instance on our desired subdirectory path if it exists.
    parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);

    // Let Ghost handle starting our server instance.
    ghostServer.start(parentApp);
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});


//kip stuff
function saveClick(productId,userId,url,req){

	var processId = userId.split('_');

	var IP;
	var headers;

	if(req.headers['x-forwarded-for']){
		IP = req.headers['x-forwarded-for'];
	}else if (req.connection.remoteAddress){
		IP = req.connection.remoteAddress;
	}else {
		IP = 'missing';
	}

	if(req.headers['user-agent']){
		headers = JSON.stringify(req.headers['user-agent']);
	}else {
		headers = 'missing';
	}

	var clicky = new Click({
		source: {
			id: userId,
			org: processId[0],
			channel: processId[1]
		},
		click: {
			productId: productId,
			url: url,
			IP: IP,
			headers: headers
		},
		click_ts: new Date()
	});

	clicky.save(function(err) {
	  if (err){
	  	console.error('Mongo err ',err)
	  }else {
		
	  }
	});
}		