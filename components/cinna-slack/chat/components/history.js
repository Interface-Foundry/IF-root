 var mongoose = require('mongoose');
// connect our DB
var db = require('db');
var Message = db.Message;
var config = require('config');
var async = require('async');
var _ = require('underscore');
var shortid = require('shortid');

process.on('uncaughtException', function (err) {
  console.log(err);
});


var saveHistory = function(data,incoming,callbackZZ) { //incoming == 1 or 0
   
    //Dont save preview searches from supervisor
    if (data.flags && data.flags.toCinna) { return }

    ///// CREATING THREAD //////
    if (data.bucket == 'search'){
        if (data.action == 'initial'){
            //user messaging Kip
            if (incoming == true){
                closeSearchThread(data); //will close a previous thread
                newParentItem(function(res){
                    data.thread = res;
                    callbackZZ(data);
                    continueSaving();
                });
            }   
            //response from Kip to user
            else if (incoming == false){
                //data thread exists, add new child item
                if (data.thread){
                    newChildItem(data,function(res){
                        data.thread = res;
                        callbackZZ(data);
                        continueSaving();
                    });
                }else {
                    console.log('warning: * * * data thread missing in history.js!!');
                    closeSearchThread(data); 
                    newParentItem(function(res){
                        data.thread = res;
                        callbackZZ(data);
                        continueSaving();
                    });
                }
            }
            else {
                console.log('Error: missing `incoming` value in saveHistory()');
            }
        }
        //all other search actions but initial
        else {

            if (data.recallHistory && data.recallHistory.thread){
                //recallHist found in data                
                newChildItem(data,function(res){
                    data.thread = res;
                    callbackZZ(data);
                    continueSaving();
                });
            } else {

                //data.recallHistory not found getting new recall
                recallHistory(data,function(recalled){

                    if (recalled && recalled.thread){
                        //retrieved new recallHist with thread in it
                        data.recallHistory = recalled;
                        newChildItem(data,function(res){
                            data.thread = res;
                            callbackZZ(data);
                            continueSaving();
                        });
                    }
                    else {
                        console.log('warning: recall and/or recall.thread not found');
                        closeSearchThread(data); 
                        newParentItem(function(res){
                            data.thread = res;
                            callbackZZ(data);
                            continueSaving();
                        });                        
                    }

                });
            }
        }
    }else {

        // switch (data.bucket) {
        //     case 'banter':

        //         break;
        //     case 'purchase':
                
        //         break;
        // } 
 
        if (incoming == true){
            closeSearchThread(data); //will close a previous thread
            newParentItem(function(res){
                data.thread = res;
                callbackZZ(data);
                continueSaving();
            });
        }   

        //response from Kip to user
        else if (incoming == false){
            newChildItem(data,function(res){
                data.thread = res;
                callbackZZ(data);
                continueSaving();
            });
        }            
    


        //just create 2 item threads!

        //create new thread? thread goes back to a search bucket?
    }


    function continueSaving(){
        if (!data.source.id){
            console.log('error: missing source.id');
        }
        else {  
            //check for incoming val
            if (typeof incoming !== 'undefined') {
                data.incoming = incoming;
            }else {
                console.log('warning: messaged saved without incoming val');
            }

            //new message mongo obj
            newMessage(data, function(msg){


                if (msg.amazon){
                    msg.amazon = [];
                    async.eachSeries(data.amazon, function(item, callback) {
                        //fuck amazon '$' keys littering their object results. go stringify and die.
                        msg.amazon.push(JSON.stringify(item));
                        callback();

                    }, function done(){
                        msg.markModified('amazon'); //lmao don't ask ;__; (tell mongo to update array)
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
                    });
                }

                else {
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
            });
        }
    }

};

var recallHistory = function(data,callback){

    if (!data.source.id){
        console.log('error: missing source.id');
    } 
    //recall using callback_id from third party messenger Kip button tap
    else if (data.slackData && data.slackData.callback_id){

        console.log('YAY!!!!! !!!!!!! ',data.slackData.callback_id);
        
        Message.findById(data.slackData.callback_id, function (err, msg) { 
            if(err){
                console.log('Error: Cannot find initial search for recallHistory');
            }   
            else {                
                if (msg && msg.amazon){
                    var tempArr = msg.amazon; //lmao amazon 
                    msg.amazon = [];
                    async.eachSeries(tempArr, function(item, callback2) {
                        msg.amazon.push(JSON.parse(item)); //ughhhh
                        callback2();
                    }, function done(){
                        callback(msg); 
                    });
                }
                else {
                    callback(msg);
                }
            }
        });

    }
    else {
        //get by bucket type
        switch (data.bucket) {
            case 'search':
                switch(data.action){

                    default: 
                        Message.findOne({'$or':[{'action':'initial'},{'action':'similar'},{'action':'modify'}],'bucket':'search','incoming':false,'source.id':data.source.id}).sort({'_id': -1}).exec(function(err, msg) {  
                            if(err){
                                console.log('Error: Cannot find initial search for recallHistory');
                            }   
                            else {
                                
                                if (msg && msg.amazon){
                                    var tempArr = msg.amazon; //lmao amazon 
                                    msg.amazon = [];
                                    async.eachSeries(tempArr, function(item, callback2) {
                                        msg.amazon.push(JSON.parse(item)); //ughhhh
                                        callback2();
                                    }, function done(){
                                        callback(msg); 
                                    });
                                }
                                else {
                                    callback(msg);
                                }
                            }
                        });

                    // //if action is focus, find lastest 'initial' item
                    // case 'focus':
                    //     //find last initial query to do focus on
                    //     Message.findOne({'bucket':'initial','incoming':false}).sort({'_id': -1}).exec(function(err, msg) {  
                    //         if(err){
                    //             console.log('Cannot find initial bucket for action:focus recallHistory');
                    //         }
                    //         else {
                    //             console.log('stuff stuff ', msg);
                    //         }
                    //     });
                    //     break;
                    // case 'similar':
                    //     Message.findOne({'bucket':'initial','incoming':false}).sort({'_id': -1}).exec(function(err, msg) {  
                    //         if(err){
                    //             console.log('Cannot find initial bucket for action:focus recallHistory');
                    //         }
                    //         else {
                    //             console.log('stuff stuff ', msg);
                    //         }
                    //     });

                    // default:
                    //     console.log('warning: no action selected for recallhistory');
                    //     // GET DEFAULT MONGO SIMILAR QUERY HERE
                        
                    //     break;
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

var recallContext = function(data,callback){
    Message.find({'source.id':data.source.id}).sort({'_id': -1}).limit(10).exec(function(err, msg) {  
        if(err){
            console.log('Error: Cannot find initial search for recallHistory');
        }   
        else {
            if (msg && msg.amazon){
                var tempArr = msg.amazon; //lmao amazon 
                msg.amazon = [];
                async.eachSeries(tempArr, function(item, callback2) {
                    msg.amazon.push(JSON.parse(item)); //ughhhh
                    callback2();
                }, function done(){
                    callback(msg); 
                });
            }
            else {
                callback(msg);
            }
        }
    });
}

//create new mongo Message obj
var newMessage = function(data,callback){
    //umm...fuck duplicates in DB
    if(data._id){
        data['_id'] = undefined;
        data['_id'] = mongoose.Types.ObjectId();
    }
    //message was created for searching in slack. mongo id = callback_id in slack action button
    if(data.searchId){
        data['_id'] = undefined;
        data['_id'] = data.searchId;
    }
    data = new Message(data);
    callback(data);
};



/////////THREAD FUNCTIONS ////

function newParentItem(callback){
    var thread = {
        id: shortid.generate(),
        sequence: 1,
        isOpen: true,
        parent:{
            isParent: true
        }
    };
    callback(thread);
}

function newChildItem(data,callback){
    //standardize thread and recallHistory.thread up here, add parent id
    if (data.thread || data.recallHistory){
        if (!data.thread){
            data.thread = {
                parent: {
                    isParent: false
                }
            };
        }else if(!data.thread.parent){
            data.thread.parent = {
                isParent: false
            };
        }
        data.thread.parent.isParent = false;
        
        //GET PARENT ID
        //from previous thread id
        if (!data.recallHistory && data.thread.id){
            data.thread.parent.id = data.thread.id; 
            data.thread.sequence++; 
            data.thread.id = shortid.generate(); //gen new idea for this item in thread
        } //from previous thread ID pulled from recallHistory
        else if (data.recallHistory && data.recallHistory.thread && data.recallHistory.thread.parent && data.recallHistory.thread.parent.id){
            //sorting difference between fresh thread from recall and one that already has thread && recallhistory.thread
            //new child thread without data.thread
            if(!data.thread.sequence){
                data.thread.sequence = data.recallHistory.thread.sequence;                    
            }
            // //new child thread with data.thread (from previous childthread create)
            // else {
            //     data.thread.sequence = data.recallHistory.thread.sequence;  
            // }
            data.thread.sequence++; 
            data.thread.parent.id = data.recallHistory.thread.parent.id; 
            data.thread.isOpen = true;
            data.thread.id = shortid.generate(); //gen new idea for this item in thread
        }else {
            console.log('* * WARNING: no parent id found in data.thread.parent OR data.recallHistory.thread.parent, geenrating random new one');
            data.thread.id = shortid.generate(); //gen new idea for this item in thread
            data.thread.parent.id = shortid.generate();
            data.thread.sequence = 1;
            data.thread.parent.isParent = false;
            data.thread.isOpen = true;
        }
        callback(data.thread);
    }
    else {
        console.log('error: data.thread missing in newChildItem(), geenrating random new one');
        data.thread = {}
        data.thread.id = shortid.generate(); //gen new idea for this item in thread
        data.thread.parent = {}
        data.thread.parent.id = shortid.generate();
        data.thread.sequence = 1;
        data.thread.parent.isParent = false;
        data.thread.isOpen = true;
    }

}

function closeSearchThread(data){
    Message.findOneAndUpdate({'bucket':'search','incoming':false,'source.id':data.source.id }, {$set:{'thread.isOpen':false}},{sort: { '_id': -1 }},function(err, doc){
        if(err){
            console.log("Something went wrong when closing thread!");
        }
    });
}


/////////// tools /////////////


/// exports
module.exports.saveHistory = saveHistory;
module.exports.recallHistory = recallHistory;
module.exports.recallContext = recallContext;
module.exports.newMessage = newMessage;
module.exports.newParentItem = newParentItem;
module.exports.newChildItem= newChildItem;