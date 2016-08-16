var async = require('async')
var _ = require('underscore')
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/foundry');

// connect our DB
var Message = require('./message_schema.js');

//create params
var paramz = {
	start_date: '2016-08-02',
	end_date: '2016-08-03'
}


doQuery(paramz,function(rez){
  console.log('Result: ',rez)
}); 


//mongo query
function doQuery(params,callback){

  console.log('input ',params)

  Message.find({"ts": {"$gte": new Date(params.start_date), "$lt": new Date(params.end_date)}})
    .select({"ts":1,"source": 1,"bucket":1,"action":1})
    .sort({'_id': 1})
    .exec(function(err, msg) {  

      console.log('zz ',msg)
    if(err){
        console.log('Error: Cannot find initial search for recallHistory');
    }   
    else {
      //if there are DB results
      if(msg.length > 0){

      	//bad code
        var collectData = [];

        //loop through DB results in async series
        async.eachSeries(msg, function(item, callback2) {

        	//construct readable date from timestamp
            var date = item.ts.getDate();
            var month = item.ts.getMonth()+1;
            var year = item.ts.getFullYear();

            item.ts_simple = year + '/' + month + '/' + date;
            //gc: change this to cart type etc. 
            //push new timestamps to array
            collectData.push(item);
            callback2();
            
        }, function done(){ //done collecting all entries in DB
        	
        	//count number of items per day
            var arr = _.chain(msg)
              .groupBy(function(item) {
                return item.ts_simple; 
              })
              .map(function(value, index) {
                  //return [index, value.length, value];
                  return [index, value.length];
              })
              .value();


           	//callback result to doQuery() function 
            callback(arr);
        });

      }
      else {
        console.log('error: no data found in msg db response');
        callback('error');
      }
    }
  });    

}