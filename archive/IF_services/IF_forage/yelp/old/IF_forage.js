
//----MONGOOOSE----//
var mongoose = require('mongoose'),
    landmarkSchema = require('./landmark_schema.js');

mongoose.connect('mongodb://localhost/yelp');
var db_mongoose = mongoose.connection;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
//---------------//
var express = require('express'), app = module.exports.app = express();
var request=require('request');

// Request API access: http://www.yelp.com/developers/getting_started/api_access

var yelp = require("yelp").createClient({
    consumer_key: "dyjR4bZkmcD_CpOTYx2Ekg",
    consumer_secret: "Coq5UbKKXYWmPy3TZf9hmNODirg",
    token: "_dDYbpK4qdeV3BWlm6ShoQdKUnz1IwCO",
    token_secret: "VGCPbsf9bN2SJi7IlM5-uYf4a98"
});
setInterval(function(){

// See http://www.yelp.com/developers/documentation/v2/search_api
    yelp.search({location: "New York City"}, function(error, data) {
        console.log(error);
        if(typeof data !='undefined')
        {
            console.log("Yelp Api Data Result")
            var businesses=data.businesses;
            for(var i=0;i<businesses.length;i++){
                var business=businesses[i];

                getLatLong(business,function(found,business,center,docs){

                    if(!found){

                        var lmSchema = new landmarkSchema.model(true);
                        lmSchema.source_yelp={};
                        lmSchema.source_yelp.rating={};
                        if(typeof business.name=='undefined')
                        {
                            lmSchema.name=0;
                        }
                        else{
                            lmSchema.name=business.name;
                        }

                        if(typeof business.description=='undefined')
                        {
                            lmSchema.description=0;
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

                        if(typeof business.image_url=='undefined')
                        {
                            lmSchema.avatar=0;
                        }
                        else{
                            lmSchema.avatar=business.image_url;
                        }

                        if(typeof center=='undefined')
                        {
                            lmSchema.lat=0;
                            lmSchema.lon=0;
                        }
                        else{
                            lmSchema.lat=center[0];
                            lmSchema.lon=center[1];
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
                        if(typeof business.reviews=='undefined')
                        {
                            lmSchema.source_yelp.reviews={};
                        }
                        else{
                            lmSchema.source_yelp.reviews=business.reviews;
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

                        /*console.log("------------------------------------------------------");
                        console.log(lmSchema);
                        console.log("------------------------------------------------------");*/
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
                    else{
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
                            docs[0].description=0;
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

                        if(typeof business.image_url=='undefined')
                        {
                            docs[0].avatar=0;
                        }
                        else{
                            docs[0].avatar=business.image_url;
                        }

                        if(typeof center=='undefined')
                        {
                            docs[0].lat=0;
                            docs[0].lon=0;
                        }
                        else{
                            docs[0].lat=center[0];
                            docs[0].lon=center[1];
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
                        if(typeof business.reviews=='undefined')
                        {
                            docs[0].source_yelp.reviews={};
                        }
                        else{
                            docs[0].source_yelp.reviews=business.reviews;
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
                                console.log("documents saved");
                            }
                            else{

                                console.log('jajja')

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


}, 15000);
function getLatLong(business,callback){

    var adress=business.location.address;

    var string='http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/';
    for(var j=0;j<adress.length;j++)
    {
        var index=adress[j];
        var arr=index.split(' ')
        string=string+arr[0];
        for(var k=1;k<arr.length;k++){
            string=string+'+'+arr[k];
        }
    }

    string=string+'+'+business.location.city+'+'+business.location.state_code+'+'+business.location.postal_code+'+'+business.location.country_code;
    string=string+'.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw';


// var source = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/75+Spring+St+2F+New+York+NY+10012+US.json?access_token=pk.eyJ1IjoiaW50ZXJmYWNlZm91bmRyeSIsImEiOiItT0hjYWhFIn0.2X-suVcqtq06xxGSwygCxw'
    request(
        {uri:string},
        function(error,response,body){
            var results=JSON.parse(body).features[0].center;

            // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            // console.log(results)
            // callback(results)


            landmarkSchema.model(false).find({"source_yelp.id":business.id.toString()}, function(err, docs) {

                if(err){
                    console.log("sds")
                    console.log("Error Occured: "+err);
                }
                else if (docs.length>0){
                    console.log("documents Found :"+business.id);
                    callback(true,business,results,docs)
                }
                else {

                    callback(false,business,results,docs);
                    console.log('No Documents');
                }

            });
        });

}

// See http://www.yelp.com/developers/documentation/v2/business
/*yelp.business("yelp-san-francisco", function(error, data) {
 console.log(error);
 console.log(data);
 });*/

//server port 
app.listen(3131, function() {
    console.log("3131 ~ ~");
});