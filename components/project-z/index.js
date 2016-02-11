var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Airport = db.Message;
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
   saveAirport(req);
   res.redirect(querystring.unescape(req.url.replace('/product/',''))); //magic cinna moment ✨ 
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


function saveAirport(req){

	var itemURL = querystring.unescape(req.url.replace('/product/','')); //magic cinna moment ✨
	
	var data = {

	};

	data = new Airport(data);

	msg.save(function(err, data){
	    if(err){
	        console.log('Mongo err ',err);
	    }
	    else{
	        //console.log('INCOMING ',incoming);
	        //console.log('STATUS ',incoming);
	        //console.log('mongo res ',data);
	        //callback('d'); //eventually send back _id for parent id??        
	    }
	}); 

}
		
              
        
