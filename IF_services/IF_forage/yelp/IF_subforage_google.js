
var express = require('express'), app = module.exports.app = express();
//var request=require('request');
var logger = require('morgan');
var async = require('async');

var fs = require('fs');
var http = require('http');

var im = require("imagemagick");
var crypto = require('crypto');
var AWS = require('aws-sdk'); 



app.use(logger('dev'));

var bodyParser = require('body-parser');

app.use(bodyParser.json({
  extended: true
})); // get information from html forms

var mongoose = require('mongoose'),
    monguurl = require('monguurl');

//----MONGOOOSE----//

//var styleSchema = require('../../../components/IF_schemas/style_schema.js');
var styles = require('./style_schema.js');
var landmarks = require('./landmark_schema.js');

mongoose.connect('mongodb://localhost/if');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//
//JR Yelp Creds
// var yelp = require("yelp").createClient({
//     consumer_key: "dyjR4bZkmcD_CpOTYx2Ekg",
//     consumer_secret: "Coq5UbKKXYWmPy3TZf9hmNODirg",
//     token: "_dDYbpK4qdeV3BWlm6ShoQdKUnz1IwCO",
//     token_secret: "VGCPbsf9bN2SJi7IlM5-uYf4a98"
// });

//April Yelp Creds:
var yelp = require("yelp").createClient({
	consumer_key: "hV6pIDq0pR-urBu-XhlwOQ",
	consumer_secret: "MuIF9fe4Bjcwbmopwc75eGPVpaA",
	token: "wt2O1ykkgdxe6Z0ZJ9ZmwzwWJyYUp-IN",
	token_secret: "UTvnuUiZMtxqfZRCEMzxtLh3C2o"
});

//April Google Creds:
//var googleAPI = 'AIzaSyAfVLiPr4LMvICmL64m3LDpU6uaW5OV_6c';

//JR Google Creds:
var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';


db.landmarks.aggregate({$sort: {"_id": 1}}, {$limit: 2}, )

function updateLandmark(){
  docs[0].save(function(err,docs){

      if(err){

          console.log("Erorr Occurred");
          console.log(err)
      }
      else if(!err)
      {
          console.log("documents saved");
      }
      else{

          console.log('jajja')

      }
  });
}
	
function getGooglePlaceID(name, address, googleAPI){
	var queryTermsToGetPlaceID = (name + "+" + address).replace(/,/g, "").replace(/\s/g, "+");
	var queryURLToGetPlaceID ="https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + queryTermsToGetPlaceID + "&key=" + googleAPI;
	console.log(queryURLToGetPlaceID);

	request({uri: queryURLToGetPlaceID, json:true}, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			//In case of more than one result, loop through to pick the one with the same zip code. 
			//Test case many results, highest one is wrong: https://maps.googleapis.com/maps/api/place/textsearch/json?query=Stephen%27s+Market+&+Grill+2632+E+Main+St+Ventura+CA+93003&key=AIzaSyCVZdZM6rmhP6WwOfhAZqlOSLGcOhXlkjo
			//Test case no results: https://maps.googleapis.com/maps/api/place/textsearch/json?query=Ten+Ren+5817+8th+Ave+Borough+Park+2011220&key=AIzaSyCVZdZM6rmhP6WwOfhAZqlOSLGcOhXlkjo

			if (body.results.length >= 1) {
				//loop through them and pick the one that matches the coordinates
				for (i = 0; i < body.results.length; i++) { 
				    if (body.results[i].formatted_address.indexOf(", United States") > 0) {
				    	var googleZip = body.results[i].formatted_address.replace(/, United States/g, "").substr(-5, 5);
				    	if (googleZip == docs[0].source_yelp.locationInfo.postal_code){

				    		var placeID = body.results[i].place_id;
								console.log(name, "   _id:  ", docs[i]._id, "  place_id:", placeID); 
								docs[0].source_google_on = true;

								docs[0].source_google.placeID = body.results[i].place_id;

								function addGoogleDetails(placeID, googleAPI){
									var queryURLToGetDetails = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeID + "&key=" + googleAPI;
									
									console.log(queryURLToGetDetails);

									request({uri: queryURLToGetDetails, json:true}, function (error, response, body) {
										if (!error && response.statusCode == 200) {
											console.log("Hello World");
										  docs[0].source_google.placeID = placeID;
										  docs[0].source_google.icon = body.result.icon;
										  // docs[0].source_google.opening_hours = body.result.opening_hours;										  
															if (typeof body.result.opening_hours=='undefined')
			                        {
			                            docs[0].source_google.opening_hours="";
			                        }
			                        else{
			                            docs[0].source_google.opening_hours=business.url;
			                        }	
										  //docs[0].source_google.weekday_text = body.result.weekday_text;
															if (typeof body.result.weekday_text=='undefined')
			                        {
			                            docs[0].source_google.weekday_text="";
			                        }
			                        else{
			                            docs[0].source_google.weekday_text=body.result.weekday_text;
			                        }	
										 // docs[0].source_google.international_phone_number = body.result.international_phone_number;
										  			 if (typeof body.result.international_phone_number=='undefined')
			                        {
			                            docs[0].source_google.international_phone_number="";
			                        }
			                        else{
			                            docs[0].source_google.international_phone_number=body.result.international_phone_number;
			                        }	
										  docs[0].source_google.price_level = body.result.price_level;
										 // docs[0].source_google.reviews = body.result.reviews;
										  				if (typeof body.result.reviews=='undefined')
			                        {
			                            docs[0].source_google.reviews="";
			                        }
			                        else{
			                            docs[0].source_google.reviews=body.result.reviews;
			                        }	
										  docs[0].source_google.url = body.result.url;
										 // docs[0].source_google.website = body.result.website;
										 					if (typeof body.result.website=='undefined')
			                        {
			                            docs[0].source_google.website="";
			                        }
			                        else{
			                            docs[0].source_google.website=body.result.website;
			                        }	
										  docs[0].source_google.types = body.result.types;
										  docs[0].source_google.utc_offset = body.result.utc_offset;
										  docs[0].source_google.vicinity = body.result.vicinity;

		                        function updateLandmark(){
		                        	console.log("hello world TWO");
			                        docs[0].save(function(err,docs){

			                            if(err){

			                                console.log("Erorr Occurred");
			                                console.log(err)
			                            }
			                            else if(!err)
			                            {
			                                console.log("documents saved");
			                            }
			                            else{

			                                console.log('jajja')

			                            }
			                        });
		                        }

									updateLandmark();

										}
									});
								}


								addGoogleDetails(body.results[i].place_id, googleAPI);


								break;
				    	}
				    }
				}
			}
			else {
				console.log("NO RESULTS");
			}

		}
	});
}
		                        // function updateLandmark(){
			                       //  docs[0].save(function(err,docs){

			                       //      if(err){

			                       //          console.log("Erorr Occurred");
			                       //          console.log(err)
			                       //      }
			                       //      else if(!err)
			                       //      {
			                       //          //console.log("documents saved");
			                       //      }
			                       //      else{

			                       //          //console.log('jajja')

			                       //      }
			                       //  });
		                        // }

// }
// 		//}
// 	});
// }

getGooglePlaceID(docs[0].name, docs[0].source_yelp.locationInfo.address + " " + docs[0].source_yelp.locationInfo.postal_code, googleAPI);

