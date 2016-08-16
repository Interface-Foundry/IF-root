var async = require('async')
var _ = require('underscore')
var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Message = db.Message;
//create params
var params = {
    start_date: '2016-08-02',
    end_date: '2016-08-02'
}
//fire query function
doQuery(params,function(rez){
    console.log('Result: ',rez)
}); 
//mongo query
function doQuery(params,callback){
  Message.find({"ts": {"$gte": new Date(params.start_date), "$lt": new Date(params.end_date)}})
    .select({"ts":1,"source": 1,"bucket":1,"action":1})
    .sort({'_id': 1})
    .exec(function(err, msg) {  
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
            //push new timestamps to array
            collectData.push(item);
            //slowing down callback here to stop memory overload
            setTimeout(function() {
              callback2();
            }, 0);
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