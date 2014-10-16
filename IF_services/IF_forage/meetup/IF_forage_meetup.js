
var express = require('express'), app = module.exports.app = express();
//var request=require('request');
var logger = require('morgan');
var async = require('async');

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

var descSort = false; //alternate this so get ascending and descending intermittently

var cloudMapName = 'forum';
var cloudMapID ='interfacefoundry.jh58g2al';

//var meetupAPI = 'b22467d19d797837175c661932275c'; //testing
var meetupAPI = '361e46474141d775c5f353f7e4f151b'; //production

var zipLow = 1001;
var zipHigh = 99950;

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
			   	searchMeetup(zipCodeQuery, function() {
			   		count++;
	                setTimeout(callback, 6000); // Wait before going on to the next tag
	            })

		    },
		    function (err) {
		        // 5 seconds have passed
		        descSort = !descSort; //toggles true / false 
		        setTimeout(callback, 10000); // Wait before looping over the hashtags again
		    }
		);
    },
    function (err) {
    }
);

// //search meetup in loops
// async.whilst(
//     function () { return true }, 
//     function (callback) {
//         async.eachSeries(zipsNY, function(tag, callback) {
//             searchMeetup(tag, function() {
//                 setTimeout(callback, 7000); // Wait before going on to the next tag
//             })
//         }, function(err) {
//             descSort = !descSort; //toggles true / false 
//             setTimeout(callback, 10000); // Wait before looping over the hashtags again
//         });
//     },
//     function (err) {
//     }
// );

//searches meetup per parameter
function searchMeetup(tag, done) {

    console.log(tag);

    //make Url and make request to meetup using request module
    var source = 'http://api.meetup.com/2/open_events?status=upcoming&radius=smart&zip='+tag+'&and_text=False&fields=event_hosts&limited_events=False&desc='+descSort+'&offset=0&photo-host=public&format=json&key='+meetupAPI+'&page=100'
    request(
        {uri:source},
        function(error,response,body){

            var idArray=[];

		    try{
		        var results=JSON.parse(body).results;
		    }catch(e){
		        console.log(e); 
		    }

            if (results){
            	
	            for(var i=0;i<results.length;i++){
	                idArray.push(results[i].id);
	                processData(i,results[i],function(found,result,docs){
	                    if(found){

	                        /**/
	                        /*Compare source_meetup.updated to Meetup "updated" value.
	                         If they are == then continue to next document in the Meetup data loop.
	                         If they are !== then update the landmarkSchema with new/edited data and continue to next document in the Meetup data loop.*/
	                        if(typeof result.updated == 'undefined'){
	                            //lmSchema.name=0;
	                        }
	                        else{
	                            docs[0].source_meetup.updated=result.updated;
	                        }

	                        docs[0].save(function(err,docs){

	                            if(err){

	                                //console.log("Erorr Occurred");
	                                console.log(err)
	                            }
	                            else if(!err)
	                            {
	                                //console.log("documents saved");
	                            }
	                            else{

	                                //console.log('jajja');

	                            }
	                        });

	                    }
	                    else{

	                        var lmSchema = new landmarks.model(true);

	                        if(typeof result.id=='undefined')
	                        {
	                            console.log('meetup doesnt have id');
	                        }
	                        else{
	                            lmSchema.id = 'meetup_'+result.id;
	                            processMeetup();
	                        }


	                        function processMeetup(){

	                        	lmSchema.world = true;
	                        	lmSchema.valid = true;
	                        	lmSchema.style.maps.cloudMapID = cloudMapID;
	                        	lmSchema.style.maps.cloudMapName = cloudMapName;
	                        	lmSchema.views = 0;

	                        	if(typeof result.photo_url=='undefined'){
	                        		lmSchema.avatar = 'img/IF/meetup_default.jpg';
	                        	}
	                        	else {
	                        		lmSchema.avatar = result.photo_url;
	                        	}

	                            //lmSchema.name= result.name;
	                            if(typeof result.name=='undefined')
	                            {
	                                lmSchema.name=0;
	                            }
	                            else{
	                                lmSchema.name=result.name;
	                            }
	                            
	                            //lmSchema.description= result.description;
	                            if(typeof result.description=='undefined')
	                            {
	                                lmSchema.description=0;
	                            }
	                            else{
	                                lmSchema.description=result.description;
	                            }

	                            lmSchema.source_meetup_on = true;


	                            //add event_hosts data as specified in fields parameter
	                            if(typeof result.event_hosts=='undefined')
	                            {
	                                lmSchema.event_hosts=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.event_hosts=result.event_hosts;
	                            }

	                            //lmSchema.time.start=result.time;
	                            if(typeof result.time=='undefined')
	                            {
	                                lmSchema.time.start=0;
	                            }
	                            else{
	                                lmSchema.time.start=result.time;
	                            }

	                            if(typeof result.duration=='undefined')
	                            {
	                                lmSchema.time.end=0;
	                            }
	                            else{
	                                lmSchema.time.end=result.time+result.duration;
	                            }
	                            //lmSchema.source_meetup.id= result.id;
	                            if(typeof result.id=='undefined')
	                            {
	                                lmSchema.source_meetup.id=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.id=result.id;
	                            }
	                            if(typeof result.status=='undefined')
	                            {
	                                lmSchema.source_meetup.status="";
	                            }
	                            else{
	                                lmSchema.source_meetup.status=result.status;
	                            }
	                            //lmSchema.source_meetup.status= result.status;
	                            if(typeof result.visibility=='undefined')
	                            {
	                                lmSchema.source_meetup.visibility="";
	                            }
	                            else{
	                                lmSchema.source_meetup.visibility=result.visibility;
	                            }
	                            //lmSchema.source_meetup.visibility= result.visibility;

	                            if(typeof result.updated=='undefined')
	                            {
	                                lmSchema.source_meetup.updated=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.updated=result.updated;
	                            }

	                            //lmSchema.source_meetup.updated= result.updated;
	                            /*venue: {
	                             id: Number,
	                             name: String,
	                             state: String,
	                             address_1: String,
	                             address_2: String,
	                             city: String,
	                             zip: Number,
	                             country: String,
	                             phone: String,
	                             },*/
	                            if(typeof result.venue=='undefined'){
	                                lmSchema.source_meetup.venue={};
	                                lmSchema.loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
	          						lmSchema.hasLoc = false;	
	                            }
	                            else{
	                                lmSchema.source_meetup.venue=result.venue;
	          						lmSchema.loc = {type: 'Point', coordinates: [result.venue.lon, result.venue.lat]};
	          						lmSchema.hasLoc = true;
	                            }

	                            /*landmarkSchema.fee: {
	                             amount: Number,
	                             description: String,
	                             label: String,
	                             required: String,
	                             accepts: String,
	                             currency: String
	                             },*/
	                            if(typeof result.fee=='undefined')
	                            {
	                                lmSchema.source_meetup.fee={};
	                            }
	                            else{
	                                lmSchema.source_meetup.fee=result.fee;
	                            }
	                            //lmSchema.source_meetup.fees=result.fees;
	                            if(typeof result.yes_rsvp_count=='undefined')
	                            {
	                                lmSchema.source_meetup.yes_rsvp_count=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.yes_rsvp_count=result.yes_rsvp_count;
	                            }

	                            //lmSchema.yes_rsvp_count=result.yes_rsvp_count,
	                            //lmSchema.rsvp_limit= result.rsvp_limit,
	                            if(typeof result.rsvp_limit=='undefined')
	                            {
	                                lmSchema.source_meetup.rsvp_limit=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.rsvp_limit=result.rsvp_limit;
	                            }
	                            //lmSchema.event_url=result.event_url;
	                            if(typeof result.event_url=='undefined')
	                            {
	                                lmSchema.source_meetup.event_url="";
	                            }
	                            else{
	                                lmSchema.source_meetup.event_url=result.event_url;
	                            }

	                            //lmSchema.how_to_find_us=result.how_to_find_us;
	                            if(typeof result.how_to_find_us=='undefined')
	                            {
	                                lmSchema.source_meetup.how_to_find_us="";
	                            }
	                            else{
	                                lmSchema.source_meetup.how_to_find_us=result.how_to_find_us;
	                            }
	                            /*landmarkSchema.group: {
	                             id: Number,
	                             name: String,
	                             who: String,
	                             group_lat: Number,
	                             group_lon: Number
	                             }*/
	                            //lmSchema.group=result.group;
	                            if(typeof result.group=='undefined')
	                            {
	                                lmSchema.source_meetup.group={};
	                            }
	                            else{
	                                lmSchema.source_meetup.group=result.group;
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
	                });
	            }
	            //console.log(idArray);

            }

    });

    done();

}

app.post('/api/process_meetups', function (req, res) {

	//var incoming = JSON.parse(req.body);

    res.send('FINISHED ADDING NEW MEETUP BUBBLES');

    async.each(req.body.groupIDs, function(tag, callback) {

    	console.log(tag);

    	searchMeetupGroups(tag, req.body.userID, function(){
    		setTimeout(callback, 500);
    	});

    }, function(err) {

       	//res.send('FINISHED ADDING NEW MEETUP BUBBLES');

    });

});



//searches meetup groups for events (from IF_server.js request)
function searchMeetupGroups(tag, userID, done) {

    //console.log('searchMeetupGroups: '+ tag);

    //make Url and make request to meetup using request module
    var source = 'https://api.meetup.com/2/events?&sign=true&photo-host=public&group_id='+tag+'&page=60&key='+meetupAPI+''

    request(
        {uri:source},
        function(error,response,body){

            var idArray=[];
            
		    try{
		        var results=JSON.parse(body).results;
		    }catch(e){
		        console.log(e); 
		    }

            if (results){
	            //console.log(results)
	            for(var i=0;i<results.length;i++){
	                idArray.push(results[i].id);
	                processData(i,results[i],function(found,result,docs){
	                    if(found){

	                        /**/
	                        /*Compare source_meetup.updated to Meetup "updated" value.
	                         If they are == then continue to next document in the Meetup data loop.
	                         If they are !== then update the landmarkSchema with new/edited data and continue to next document in the Meetup data loop.*/
	                        if(typeof result.updated == 'undefined'){
	                            //lmSchema.name=0;
	                        }
	                        else{
	                            docs[0].source_meetup.updated=result.updated;
	                        }

	                        docs[0].save(function(err,docs){

	                            if(err){

	                               // console.log("Erorr Occurred");
	                                console.log(err)
	                            }
	                            else if(!err)
	                            {
	                                //console.log("documents saved");
	                            }
	                            else{

	                               // console.log('jajja');

	                            }
	                        });

	                    }
	                    else{

	                        var lmSchema = new landmarks.model(true);

	                        if(typeof result.id=='undefined')
	                        {
	                            console.log('meetup doesnt have id');
	                        }
	                        else{
	                            lmSchema.id = 'meetup_'+result.id;
	                            processMeetup();
	                        }


	                        function processMeetup(){

	                        	lmSchema.world = true;
	                        	lmSchema.valid = true;
	                        	lmSchema.style.maps.cloudMapID = cloudMapID;
	                        	lmSchema.style.maps.cloudMapName = cloudMapName;
	                        	lmSchema.views = 0;

	                        	//
	                        	if (userID){	
	                        		//**TEMPORARY to prevent overwriting another owner
	                        		if(!lmSchema.permissions.ownerID){
	                        			lmSchema.permissions.ownerID = userID; //from auth'd user meetup login
	                        		}
	                        	}

	                        	lmSchema.avatar = 'img/IF/meetup_default.jpg';

	                            //lmSchema.name= result.name;
	                            if(typeof result.name=='undefined')
	                            {
	                                lmSchema.name=0;
	                            }
	                            else{
	                                lmSchema.name=result.name;
	                            }
	                            
	                            //lmSchema.description= result.description;
	                            if(typeof result.description=='undefined')
	                            {
	                                lmSchema.description=0;
	                            }
	                            else{
	                                lmSchema.description=result.description;
	                            }

	                            //add event_hosts data as specified in fields parameter
	                            if(typeof result.event_hosts=='undefined')
	                            {
	                                lmSchema.event_hosts=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.event_hosts=result.event_hosts;
	                            }

	                            //lmSchema.time.start=result.time;
	                            if(typeof result.time=='undefined')
	                            {
	                                lmSchema.time.start=0;
	                            }
	                            else{
	                                lmSchema.time.start=result.time;
	                            }

	                            if(typeof result.duration=='undefined')
	                            {
	                                lmSchema.time.end=0;
	                            }
	                            else{
	                                lmSchema.time.end=result.time+result.duration;
	                            }

	                            //data source is from Meetup
	                            lmSchema.source_meetup_on = true;


	                            //lmSchema.source_meetup.id= result.id;
	                            if(typeof result.id=='undefined')
	                            {
	                                lmSchema.source_meetup.id=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.id=result.id;
	                            }
	                            if(typeof result.status=='undefined')
	                            {
	                                lmSchema.source_meetup.status="";
	                            }
	                            else{
	                                lmSchema.source_meetup.status=result.status;
	                            }
	                            //lmSchema.source_meetup.status= result.status;
	                            if(typeof result.visibility=='undefined')
	                            {
	                                lmSchema.source_meetup.visibility="";
	                            }
	                            else{
	                                lmSchema.source_meetup.visibility=result.visibility;
	                            }
	                            //lmSchema.source_meetup.visibility= result.visibility;

	                            if(typeof result.updated=='undefined')
	                            {
	                                lmSchema.source_meetup.updated=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.updated=result.updated;
	                            }

	                            //lmSchema.source_meetup.updated= result.updated;
	                            /*venue: {
	                             id: Number,
	                             name: String,
	                             state: String,
	                             address_1: String,
	                             address_2: String,
	                             city: String,
	                             zip: Number,
	                             country: String,
	                             phone: String,
	                             },*/
	                            if(typeof result.venue=='undefined'){
	                                lmSchema.source_meetup.venue={};
	                                lmSchema.loc = {type: 'Point',coordinates: [-74.0059,40.7127]};
	          						lmSchema.hasLoc = false;	
	                            }
	                            else{
	                                lmSchema.source_meetup.venue=result.venue;
	          						lmSchema.loc = {type: 'Point', coordinates: [result.venue.lon, result.venue.lat]};
	          						lmSchema.hasLoc = true;
	                            }

	                            /*landmarkSchema.fee: {
	                             amount: Number,
	                             description: String,
	                             label: String,
	                             required: String,
	                             accepts: String,
	                             currency: String
	                             },*/
	                            if(typeof result.fee=='undefined')
	                            {
	                                lmSchema.source_meetup.fee={};
	                            }
	                            else{
	                                lmSchema.source_meetup.fee=result.fee;
	                            }
	                            //lmSchema.source_meetup.fees=result.fees;
	                            if(typeof result.yes_rsvp_count=='undefined')
	                            {
	                                lmSchema.source_meetup.yes_rsvp_count=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.yes_rsvp_count=result.yes_rsvp_count;
	                            }

	                            //lmSchema.yes_rsvp_count=result.yes_rsvp_count,
	                            //lmSchema.rsvp_limit= result.rsvp_limit,
	                            if(typeof result.rsvp_limit=='undefined')
	                            {
	                                lmSchema.source_meetup.rsvp_limit=0;
	                            }
	                            else{
	                                lmSchema.source_meetup.rsvp_limit=result.rsvp_limit;
	                            }
	                            //lmSchema.event_url=result.event_url;
	                            if(typeof result.event_url=='undefined')
	                            {
	                                lmSchema.source_meetup.event_url="";
	                            }
	                            else{
	                                lmSchema.source_meetup.event_url=result.event_url;
	                            }

	                            //lmSchema.how_to_find_us=result.how_to_find_us;
	                            if(typeof result.how_to_find_us=='undefined')
	                            {
	                                lmSchema.source_meetup.how_to_find_us="";
	                            }
	                            else{
	                                lmSchema.source_meetup.how_to_find_us=result.how_to_find_us;
	                            }
	                            /*landmarkSchema.group: {
	                             id: Number,
	                             name: String,
	                             who: String,
	                             group_lat: Number,
	                             group_lon: Number
	                             }*/
	                            //lmSchema.group=result.group;
	                            if(typeof result.group=='undefined')
	                            {
	                                lmSchema.source_meetup.group={};
	                            }
	                            else{
	                                lmSchema.source_meetup.group=result.group;
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
						            st.widgets.twitter = forumStyle.widgets.twitter;
						            st.widgets.instagram = forumStyle.widgets.instagram;
						            st.widgets.upcoming = forumStyle.widgets.upcoming;
						            st.widgets.category = forumStyle.widgets.category;
						            st.widgets.googledoc = forumStyle.widgets.googledoc;
						            st.widgets.checkin = forumStyle.widgets.checkin;

						            //Meetup tests
						            st.widgets.chat = forumStyle.widgets.chat;
						            st.widgets.mailing_list = forumStyle.widgets.mailing_list;
						            st.widgets.icebreaker = forumStyle.widgets.icebreaker;
						            st.widgets.photo_share = forumStyle.widgets.photo_share;
						            st.widgets.stickers = forumStyle.widgets.stickers;

						            
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
		                                    console.log(err);
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
	                });
	            }
        	}
            //console.log(idArray);
    });

    done();

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
app.listen(3134, 'localhost', function() {
    console.log("3134 ~ ~");
});