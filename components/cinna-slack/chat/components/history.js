var mongoose = require('mongoose');
var Message = require('../models/Message'); //message model
var config = require('config');

// connect our DB
mongoose.connect(config.mongodb.url);
process.on('uncaughtException', function (err) {
  console.log(err);
});


var saveHistory = function(data,incoming) { //incoming == 1 or 0

    // / / / / / / / /
    //CHECK FOR "recallhistory" property, remove
    // / / / / / / / / 

    if (!data.source.id){
        console.log('error: missing source.id');
    }
    else {

        //data.amazon = ['ad','asdfasdf'];

        //pre-process data for saving

        // if (msgObj.amazon){

        //     delete msgObj.amazon;

        //     console.log('fire.....   ',msgObj)


        //     // async.eachSeries(data.amazon, function(item, callback) {

        //     //     messageHistory[data.source.id].cart.push(item.amazon[searchSelect - 1]); //add selected items to cart
        //     //     callback();
        //     // }, function done(){
        //     //     //only support "add to cart" message for one item.
        //     //     //static:
        //     //     var sT = data.searchSelect[0];
        //     //     // data.client_res = item.amazon[sT - 1].ItemAttributes[0].Title + ' added to your cart. Type <i>remove item</i> to undo.';

        //     //     // outgoingResponse(data,'txt');
        //     //     purchase.outputCart(data,messageHistory[data.source.id],function(res){
        //     //         outgoingResponse(res,'txt');
        //     //     });
        //     // });

        // }



        console.log('SAVING OBJ ',data);


        //console.log(';) ',msgObj);

    
        data.save( function(err, data){
            if(err){
                console.log('Mongo err ',err);
            }
            else{
                console.log('mongo res ',data);
            }
        });
        //callback('d'); //eventually send back _id for parent id??        
    }
};

var recallHistory = function(data,callback){

    if (!data.source.id){
        console.log('error: missing source.id');
    }
    else {
        //get by bucket type
        switch (data.bucket) {
            case 'search':
                switch(data.action){
                    //if action is focus, find lastest 'initial' item
                    case 'focus':
                        //find last initial query to do focus on
                        Message.findOne({'bucket':'initial'}).sort({'_id': -1}).exec(function(err, msg) {  
                            if(err){
                                console.log('Cannot find initial bucket for action:focus recallHistory');
                            }
                            else {
                                console.log('stuff stuff ', msg);
                                //callback(msg);
                            }
                        });
                        break;

                    default:
                        //
                        // var arrLength = messageHistory[data.source.id].search.length - steps; //# of steps to reverse. default is 1
                        // callback(messageHistory[data.source.id].search[arrLength]); //get last item in arr
                        break;
                }

                break;
            case 'banter':

                // var arrLength = messageHistory[data.source.id].banter.length - steps; //# of steps to reverse. default is 1
                // callback(messageHistory[data.source.id].banter[arrLength]); //get last item in arr
                break;
            case 'purchase':
                // var arrLength = messageHistory[data.source.id].purchase.length - steps; //# of steps to reverse. default is 1
                // callback(messageHistory[data.source.id].purchase[arrLength]); //get last item in arr
            default:
        }        
    }

};

//create new mongo Message obj
var newMessage = function(data,callback){
    data = new Message(data);

    console.log('CREATING OBJ ',data);

    callback(data);
};


/////////// tools /////////////


/// exports
module.exports.saveHistory = saveHistory;
module.exports.recallHistory = recallHistory;
module.exports.newMessage = newMessage;
