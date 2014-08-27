
//----MONGOOOSE----//
var mongoose = require('mongoose'),
    landmarkSchema = require('./landmark_schema.js');

mongoose.connect('mongodb://localhost/iftest');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//
var express = require('express'), app = module.exports.app = express();
///////////
//Require Request Module for making api calls to meetup
var request=require('request');

setInterval(function(){

//make Url and make request to meetup using request module
    var source = 'http://api.meetup.com/2/open_events?status=upcoming&radius=100.0&state=ny&and_text=False&limited_events=False&desc=False&city=New+York&offset=0&photo-host=public&format=json&page=20&country=us&key=361e46474141d775c5f353f7e4f151b'
    request(
        {uri:source},
        function(error,response,body){

            var idArray=[];
            var results=JSON.parse(body).results;
            //console.log(results)
            for(var i=0;i<results.length;i++){
                idArray.push(results[i].id);
                processData(i,results[i],function(found,result,docs){
                    if(found){

                        /**/
                        /*Compare source_meetup.updated to Meetup "updated" value.
                         If they are == then continue to next document in the Meetup data loop.
                         If they are !== then update the landmarkSchema with new/edited data and continue to next document in the Meetup data loop.*/
                        if(typeof result.updated=='undefined')
                        {
                            //lmSchema.name=0;
                        }
                        else{
                            docs[0].source_meetup.updated=result.updated;
                        }

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
                    else{

                        var lmSchema = new landmarkSchema.model(true);
                        //lmSchema.name= result.name;
                        if(typeof result.name=='undefined')
                        {
                            lmSchema.name=0;
                        }
                        else{
                            lmSchema.name=result.name;
                        }
                        //	landmarkSchema.id: ,

                        //lmSchema.description= result.description;
                        if(typeof result.description=='undefined')
                        {
                            lmSchema.description=0;
                        }
                        else{
                            lmSchema.description=result.description;
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
                        if(typeof result.venue=='undefined')
                        {
                            lmSchema.source_meetup.venue={};
                            lmSchema.lat= 0;
                            lmSchema.lon=  0;
                        }
                        else{
                            lmSchema.source_meetup.venue=result.venue;
                            lmSchema.lat= result.venue.lat;
                            lmSchema.lon=  result.venue.lon;
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
                        lmSchema.save(function(err,docs){
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
                });
            }
            console.log(idArray);
        }
    )

}, 9000);



function processData(i,result,callback){
    landmarkSchema.model(false).find({"source_meetup.id":result.id.toString()}, function(err, docs) {

        if(err){
            console.log("sds")
            console.log("Error Occured: "+err);
        }
        else if (docs.length>0){
            console.log("documents Found :"+result.id);
            callback(true,result,docs)
        }
        else {

            callback(false,result,docs);
            console.log('No Documents');
        }

    });
}



//server port 
app.listen(3131, function() {
    console.log("3131 ~ ~");
});