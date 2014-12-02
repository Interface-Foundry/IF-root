
var express = require('express'), app = module.exports.app = express();
//var request=require('request');
var logger = require('morgan');
var async = require('async');

var fs = require('fs');

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
///////////
//Require Request Module for making api calls to meetup
var request=require('request');

var forumStyle = require('./forum_theme.json');

var cloudMapName = 'forum';
var cloudMapID ='interfacefoundry.jh58g2al';

var yelp = require("yelp").createClient({
    consumer_key: "dyjR4bZkmcD_CpOTYx2Ekg",
    consumer_secret: "Coq5UbKKXYWmPy3TZf9hmNODirg",
    token: "_dDYbpK4qdeV3BWlm6ShoQdKUnz1IwCO",
    token_secret: "VGCPbsf9bN2SJi7IlM5-uYf4a98"
});

var zipLow = 1001;
var zipHigh = 99950;

// var zipLow = 10010;
// var zipHigh = 10011;

var offsetCounter = 0; //offset, increases by multiples of 20 until it reaches 600
var sortCounter = 0; //sort type, switches between 0 (best by search query), and 2, sorted by highest rating

//search meetup in loops
async.whilst(
    function () { return true }, 
    function (callback) {

		var count = zipLow;

		async.whilst(
		    function () { return count != zipHigh; },
		    function (callback) {

		    	var zipCodeQuery;
		    	//so number will format as zip code digit with 0 in front
		    	if (count < 10000){
		    		zipCodeQuery = '0'+parseInt(count);
		    	}
		    	else {
		    		zipCodeQuery = parseInt(count);
		    	}
			   	searchYelp(zipCodeQuery, function() {
			   		count++;
	                setTimeout(callback, 6000); // Wait before going on to the next tag
	            })

		    },
		    function (err) {

		    	//iterating over offset to get all the yelps
		    	if (offsetCounter >= 60){

		    		//reset offset
		    		offsetCounter = 0;

		    		//rotating through sort counters
		    		// if (sortCounter == 0){
		    		// 	sortCounter = 2;
		    		// }
		    		// else if (sortCounter == 2){
		    		// 	sortCounter = 0;
		    		// }
		    		// else {
		    		// 	sortCounter = 0;
		    		// }

		    		if (sortCounter == 2){
		    			sortCounter = 0;
		    		}
		    		else{
		    			sortCounter++;
		    		}
		    		

		    	}
		    	else {
		    		//incrementing until 60
		    		offsetCounter = offsetCounter + 20;
		    	}

		        setTimeout(callback, 10000); // Wait before looping over the hashtags again
		    }
		);
    },
    function (err) {
    }
);




//searches yelp per parameter
function searchYelp(tag, done) {

    console.log(tag);
	
	console.log('------ offset --------');
    console.log(offsetCounter);


	console.log('------ sort --------');
    console.log(sortCounter);

    yelp.search({location: tag, limit:20, offset:offsetCounter, sort:sortCounter}, function(error, data) {
        console.log(error);
        if(typeof data !='undefined')
        {	
        	//console.log(data);
            console.log("Yelp Api Data Result")
            var businesses=data.businesses;
            for(var i=0;i<businesses.length;i++){
                var business=businesses[i];

                getLatLong(business,function(found,business,center,docs){

                    if(!found){	

                    	//console.log('-------------------- doc new, creating!! =------------');

                        var lmSchema = new landmarks.model(true);

                        if(typeof business.id=='undefined')
                        {
                            console.log('yelp doesnt have id');
                        }
                        else{
                            lmSchema.id = 'yelp_'+business.id;
                            processYelp();
                        }

                        function processYelp(){

                        	lmSchema.world = true;
                        	lmSchema.valid = true;
                        	lmSchema.style.maps.cloudMapID = cloudMapID;
                        	lmSchema.style.maps.cloudMapName = cloudMapName;
                        	lmSchema.views = 0;       

	                        lmSchema.source_yelp={};
	                        lmSchema.source_yelp.rating={};

                        	if(typeof business.image_url=='undefined'){
                        		lmSchema.avatar = 'img/IF/yelp_default.jpg';
                        	}
                        	else {
								
								lmSchema.avatar = business.image_url;
								
                        		//small image? go for big!
                        		if( business.image_url.indexOf('ms.jpg') >= 0){
                        			lmSchema.source_yelp.business_image = business.image_url.replace("ms.jpg", "l.jpg");
								}
                        		
                        	}

	                        if(typeof business.name=='undefined')
	                        {
	                            lmSchema.name=0;
	                        }
	                        else{
	                            lmSchema.name=business.name;
	                        }

	                        if(typeof business.description=='undefined')
	                        {
	                            //lmSchema.description=0;
	                        }
	                        else{
	                            lmSchema.description=business.description;
	                        }	                        


	                        if(typeof business.snippet_text=='undefined')
	                        {
	                            lmSchema.summary=0;
	                        }
	                        else{
	                            lmSchema.summary=business.snippet_text;
	                        }

	               //          if(typeof center=='undefined')
	               //          {
                //                 lmSchema.loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
          						// lmSchema.hasLoc = false;
	               //          }
	               //          else{
          						// lmSchema.loc = {type: 'Point', coordinates: [center[0], center[1]]};
          						// lmSchema.hasLoc = true;
	               //          }

	                        if(typeof business.location.coordinate=='undefined')
	                        {
                                lmSchema.loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
          						lmSchema.hasLoc = false;
	                        }
	                        else{
          						lmSchema.loc = {type: 'Point', coordinates: [business.location.coordinate.longitude, business.location.coordinate.latitude]};
          						lmSchema.hasLoc = true;
	                        }


	                        if(typeof business.categories=='undefined')
	                        {
	                            lmSchema.categories={};
	                        }
	                        else{
	                            lmSchema.categories=business.categories;
	                        }	                        

	                        if(typeof business.id=='undefined')
	                        {
	                            lmSchema.source_yelp.id="";
	                        }
	                        else{
	                            lmSchema.source_yelp.id=business.id;
	                        }
	                        if(typeof business.is_closed=='undefined')
	                        {
	                            lmSchema.source_yelp.is_closed="";
	                        }
	                        else{
	                            lmSchema.source_yelp.is_closed=business.is_closed;
	                        }
	                        if(typeof business.is_claimed=='undefined')
	                        {
	                            lmSchema.source_yelp.is_claimed="";
	                        }
	                        else{
	                            lmSchema.source_yelp.is_claimed=business.is_claimed;
	                        }
	                        if(typeof business.url=='undefined')
	                        {
	                            lmSchema.source_yelp.url="";
	                        }
	                        else{
	                            lmSchema.source_yelp.url=business.url;
	                        }
	                        if(typeof business.mobile_url=='undefined')
	                        {
	                            lmSchema.source_yelp.mobile_url="";
	                        }
	                        else{
	                            lmSchema.source_yelp.mobile_url=business.mobile_url;
	                        }
	                        if(typeof business.phone=='undefined')
	                        {
	                            lmSchema.source_yelp.phone="";
	                        }
	                        else{
	                            lmSchema.source_yelp.phone=business.phone;
	                        }
	                        if(typeof business.display_phone=='undefined')
	                        {
	                            lmSchema.source_yelp.display_phone="";
	                        }
	                        else{
	                            lmSchema.source_yelp.display_phone=business.display_phone;
	                        }
	                        if(typeof business.snippet_image_url=='undefined')
	                        {
	                            lmSchema.source_yelp.snippet_image_url="";
	                        }
	                        else{
	                            lmSchema.source_yelp.snippet_image_url=business.snippet_image_url;
	                        }
	                        if(typeof business.deals=='undefined')
	                        {
	                            lmSchema.source_yelp.deals={};
	                        }
	                        else{
	                            lmSchema.source_yelp.deals=business.deals;
	                        }




	                        // if(typeof business.reviews=='undefined')
	                        // {
	                        //     lmSchema.source_yelp.reviews={};
	                        // }
	                        // else{
	                        //     lmSchema.source_yelp.reviews=business.reviews;
	                        // }

	                        if(typeof business.location=='undefined')
	                        {
	                            lmSchema.source_yelp.locationInfo={};
	                        }
	                        else{
	                            lmSchema.source_yelp.locationInfo=business.location;
	                        }

	                        if(typeof business.categories=='undefined')
	                        {
	                            lmSchema.source_yelp.categories=[];
	                        }
	                        else{
	                            lmSchema.source_yelp.categories=business.categories;
	                        }



	                        if(typeof business.review_count=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.review_count="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.review_count=business.review_count;
	                        }
	                        if(typeof business.review_count=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.review_count="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.review_count=business.review_count;
	                        }
	                        if(typeof business.rating=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.rating="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.rating=business.rating;
	                        }
	                        if(typeof business.rating_img_url=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.rating_img_url="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.rating_img_url=business.rating_img_url;
	                        }
	                        if(typeof business.rating_img_url_small=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.rating_img_url_small="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.rating_img_url_small=business.rating_img_url_small;
	                        }
	                        if(typeof business.rating_img_url_large=='undefined')
	                        {
	                            lmSchema.source_yelp.rating.rating_img_url_large="";
	                        }
	                        else{
	                            lmSchema.source_yelp.rating.rating_img_url_large=business.rating_img_url_large;
	                        }



                            saveStyle(forumStyle.name, function(styleRes){ //creating new style to add to landmark

                        		saveNewLandmark(styleRes);
                    		});
                    
                            //loading style from JSON, saving
					        function saveStyle(inputName, callback){

					        	var st = new styles.model(true);

					        	st.name = inputName;
					        	st.bodyBG_color = forumStyle.bodyBG_color;
					        	st.titleBG_color = forumStyle.titleBG_color;
					        	st.navBG_color = forumStyle.navBG_color;
					        	st.landmarkTitle_color = forumStyle.landmarkTitle_color;
					            st.categoryTitle_color = forumStyle.categoryTitle_color;
					            st.widgets.twitter = forumStyle.twitter;
					            st.widgets.instagram = forumStyle.instagram;
					            st.widgets.upcoming = forumStyle.upcoming;
					            st.widgets.category = forumStyle.category;
					            st.widgets.googledoc = forumStyle.googledoc;
					            st.widgets.checkin = forumStyle.checkin;

					            //Meetup tests
					            st.widgets.messages = forumStyle.widgets.messages;
					            st.widgets.mailing_list = forumStyle.widgets.mailing_list;
					            st.widgets.icebreaker = forumStyle.widgets.icebreaker;
					            st.widgets.photo_share = forumStyle.widgets.photo_share;
					            st.widgets.stickers = forumStyle.widgets.stickers;
					            st.widgets.streetview = forumStyle.widgets.streetview;

					            
					            function saveIt(callback){
					            	
					                st.save(function (err, style) {
					                    if (err)
					                        handleError(res, err);
					                    else {
					                        callback(style._id);
					                    }
					                });
					            }
					            saveIt(function (res) {
					            	
					                callback(res);
					            });
					        }

					        function saveNewLandmark(styleRes){
					        	
					        	if (styleRes !== undefined){ //if new styleID created for world
                        			lmSchema.style.styleID = styleRes;
                    			}

	         					lmSchema.save(function(err,docs){
	                                if(err){
	                                    //console.log("Erorr Occurred");
	                                    console.log(err)
	                                }
	                                else if(!err)
	                                {
	                                    //console.log("documents saved");
	                                }
	                                else{
	                                    //console.log('jajja')
	                                }
	                            });

					        }

                        }


                    }
                    else{

                    	//console.log('-------------------- doc found, updating!! =------------');

                    	docs[0].world = true;
                    	docs[0].valid = true;
                    	docs[0].style.maps.cloudMapID = cloudMapID;
                    	docs[0].style.maps.cloudMapName = cloudMapName;
                    	docs[0].views = 0;       
                	

						//if document is already save in db then update it
                        if(typeof business.name=='undefined')
                        {
                            docs[0].name=0;
                        }
                        else{
                            docs[0].name=business.name;
                        }

                        if(typeof business.description=='undefined')
                        {
                            //docs[0].description=0;
                        }
                        else{
                            docs[0].description=business.description;
                        }

                        if(typeof business.snippet_text=='undefined')
                        {
                            docs[0].summary=0;
                        }
                        else{
                            docs[0].summary=business.snippet_text;
                        }


                    	if(typeof business.image_url=='undefined'){
                    		docs[0].avatar = 'img/IF/yelp_default.jpg';
                    	}
                    	else {


                    		docs[0].avatar = business.image_url;

                    		//small image? go for big!
                    		if( business.image_url.indexOf('ms.jpg') >= 0){
                    			docs[0].source_yelp.business_image = business.image_url.replace("ms.jpg", "l.jpg");
							}
                    	}
                        	

            //             if(typeof center=='undefined')
            //             {
            //                 docs[0].loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
      						// docs[0].hasLoc = false;
            //             }
            //             else{
      						// docs[0].loc = {type: 'Point', coordinates: [center[0], center[1]]};
      						// docs[0].hasLoc = true;
            //             }

                        if(typeof business.location.coordinate=='undefined')
                        {
                            docs[0].loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
      						docs[0].hasLoc = false;
                        }
                        else{
      						docs[0].loc = {type: 'Point', coordinates: [business.location.coordinate.longitude, business.location.coordinate.latitude]};
      						docs[0].hasLoc = true;
                        }


                        if(typeof business.categories=='undefined')
                        {
                            docs[0].categories={};
                        }
                        else{
                            docs[0].categories=business.categories;
                        }
                        if(typeof business.id=='undefined')
                        {
                            docs[0].source_yelp.id="";
                        }
                        else{
                            docs[0].source_yelp.id=business.id;
                        }
                        if(typeof business.is_closed=='undefined')
                        {
                            docs[0].source_yelp.is_closed="";
                        }
                        else{
                            docs[0].source_yelp.is_closed=business.is_closed;
                        }
                        if(typeof business.is_claimed=='undefined')
                        {
                            docs[0].source_yelp.is_claimed="";
                        }
                        else{
                            docs[0].source_yelp.is_claimed=business.is_claimed;
                        }
                        if(typeof business.url=='undefined')
                        {
                            docs[0].source_yelp.url="";
                        }
                        else{
                            docs[0].source_yelp.url=business.url;
                        }
                        if(typeof business.mobile_url=='undefined')
                        {
                            docs[0].source_yelp.mobile_url="";
                        }
                        else{
                            docs[0].source_yelp.mobile_url=business.mobile_url;
                        }
                        if(typeof business.phone=='undefined')
                        {
                            docs[0].source_yelp.phone="";
                        }
                        else{
                            docs[0].source_yelp.phone=business.phone;
                        }
                        if(typeof business.display_phone=='undefined')
                        {
                            docs[0].source_yelp.display_phone="";
                        }
                        else{
                            docs[0].source_yelp.display_phone=business.display_phone;
                        }
                        if(typeof business.snippet_image_url=='undefined')
                        {
                            docs[0].source_yelp.snippet_image_url="";
                        }
                        else{
                            docs[0].source_yelp.snippet_image_url=business.snippet_image_url;
                        }
                        if(typeof business.deals=='undefined')
                        {
                            docs[0].source_yelp.deals={};
                        }
                        else{
                            docs[0].source_yelp.deals=business.deals;
                        }


                        // if(typeof business.reviews=='undefined')
                        // {
                        //     docs[0].source_yelp.reviews={};
                        // }
                        // else{
                        //     docs[0].source_yelp.reviews=business.reviews;
                        // }

                        if(typeof business.location=='undefined')
                        {
                            docs[0].source_yelp.locationInfo={};
                        }
                        else{
                            docs[0].source_yelp.locationInfo=business.location;
                        }

                        if(typeof business.categories=='undefined')
                        {
                            docs[0].source_yelp.categories=[];
                        }
                        else{
                            docs[0].source_yelp.categories=business.categories;
                        }



                        if(typeof business.review_count=='undefined')
                        {
                            docs[0].source_yelp.rating.review_count="";
                        }
                        else{
                            docs[0].source_yelp.rating.review_count=business.review_count;
                        }
                        if(typeof business.review_count=='undefined')
                        {
                            docs[0].source_yelp.rating.review_count="";
                        }
                        else{
                            docs[0].source_yelp.rating.review_count=business.review_count;
                        }
                        if(typeof business.rating=='undefined')
                        {
                            docs[0].source_yelp.rating.rating="";
                        }
                        else{
                            docs[0].source_yelp.rating.rating=business.rating;
                        }
                        if(typeof business.rating_img_url=='undefined')
                        {
                            docs[0].source_yelp.rating.rating_img_url="";
                        }
                        else{
                            docs[0].source_yelp.rating.rating_img_url=business.rating_img_url;
                        }
                        if(typeof business.rating_img_url_small=='undefined')
                        {
                            docs[0].source_yelp.rating.rating_img_url_small="";
                        }
                        else{
                            docs[0].source_yelp.rating.rating_img_url_small=business.rating_img_url_small;
                        }
                        if(typeof business.rating_img_url_large=='undefined')
                        {
                            docs[0].source_yelp.rating.rating_img_url_large="";
                        }
                        else{
                            docs[0].source_yelp.rating.rating_img_url_large=business.rating_img_url_large;
                        }


                        docs[0].save(function(err,docs){

                            if(err){

                                console.log("Erorr Occurred");
                                console.log(err)
                            }
                            else if(!err)
                            {
                                //console.log("documents saved");
                            }
                            else{

                                //console.log('jajja')

                            }
                        });

                    }

                });
            }
        }
        else{

            console.log("Yelp Api error")
        }

    });

    done();

}



function getLatLong(business,callback){

    // var adress=business.location.address;

    // var string='http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/';
    // for(var j=0;j<adress.length;j++)
    // {
    //     var index=adress[j];
    //     var arr=index.split(' ')
    //     string=string+arr[0];
    //     for(var k=1;k<arr.length;k++){
    //         string=string+'+'+arr[k];
    //     }
    // }

    // string=string+'+'+business.location.city+'+'+business.location.state_code+'+'+business.location.postal_code+'+'+business.location.country_code;
    // string=string+'.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';

    // request(
    //     {uri:string},
    //     function(error,response,body){

    //     	var parseTest = JSON.parse(body);

	   //      	if (parseTest.features && parseTest.features.length){
		  //       	if(parseTest.features[0]){   
			 //            var results=JSON.parse(body).features[0].center;
			 //            landmarks.model(false).find({"source_yelp.id":business.id.toString()}, function(err, docs) {
			 //                if(err){
			 //                    console.log("sds")
			 //                    console.log("Error Occured: "+err);
			 //                }
			 //                else if (docs.length>0){
			 //                    console.log("documents Found :"+business.id);
			 //                    callback(true,business,results,docs)
			 //                }
			 //                else {
			 //                    callback(false,business,results,docs);
			 //                    console.log('No Documents');
			 //                }
			 //            });	
				// 	}
				// }

    //     });

    	//removed loc search 
    	var results = 'fakeLoc';
        landmarks.model(false).find({"source_yelp.id":business.id.toString()}, function(err, docs) {
            if(err){
                console.log("error")
                console.log("Error Occured: "+err);
            }
            else if (docs.length>0){
                //console.log("documents Found :"+business.id);
                callback(true,business,results,docs)
            }
            else {
                callback(false,business,results,docs);
                //console.log('No Documents');
            }
        });	

}



function processData(i,result,callback){
    landmarks.model(false).find({"source_meetup.id":result.id.toString()}, function(err, docs) {

        if(err){
            //console.log("Error Occured: "+err);
        }
        else if (docs.length>0){
            //console.log("documents Found :"+result.id);
            callback(true,result,docs);
        }
        else {

            callback(false,result,docs);
            //console.log('No Documents');
        }

    });
}



//server port 
app.listen(3137, 'localhost', function() {
    console.log("3137 ~ ~");
});