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


var saveHistory = function(data,incoming) { //incoming == 1 or 0

    // / / / / / / / /
    //CHECK FOR "recallhistory" property, remove
    // / / / / / / / / 

    //currentbucket
    //currentaction

    // thread: {
    //     id: String,
    //     sequence: Number,
    //     isOpen: Boolean,
    //     ticket: {
    //         id: String, 
    //         isOpen: Boolean
    //     },
    //     parent: {
    //         isParent:Boolean,
    //         parentId:String
    //     }
    // }

    //if bucket == search
    //if action == initial

    console.log('INCOMING ',incoming);
    console.log('BUCKET ',data.bucket);
    console.log('ACTION ',data.action);

    if (data.bucket == 'search'){
        if (data.action == 'initial'){
            //user messaging Kip
            if (incoming == true){
                newParentItem(function(res){
                    data.thread = res;
                    console.log('new parent thread ',res);
                });
            }   
            //response from Kip to user
            else if (incoming == false){
                //data thread exists, add new child item
                if (data.thread){
                    newChildItem(data,function(res){
                        data.thread = res;
                        console.log('new child thread ',res);
                    });
                }else {
                    console.log('warning: * * * data thread missing in history.js!!')
                    newParentItem(function(res){
                        data.thread = res;
                        console.log('new parent thread ',res);
                    });
                }
            }
            else {
                console.log('Error: missing `incoming` value in saveHistory()');
            }
        }
        //all other search actions but initial
        else {
            //data thread exists, adding new child item

            //get last item in thread
            // Message.findOne({'$or':[{'action':'initial'},{'action':'similar'},{'action':'modify'}],'bucket':'search','incoming':false,'source.id':data.source.id}).sort({'_id': -1}).exec(function(err, msg) {  
            //     if(err){
            //         console.log('Error: Cannot find initial search for recallHistory');
            //     }   
            //     else {
            //         if (msg && msg.amazon){
            //             var tempArr = msg.amazon; //lmao amazon 
            //             msg.amazon = [];
            //             async.eachSeries(tempArr, function(item, callback2) {
            //                 msg.amazon.push(JSON.parse(item)); //ughhhh
            //                 callback2();
            //             }, function done(){
            //                 callback(msg); 
            //             });
            //         }
            //         else {
            //             callback(msg);
            //         }
            //     }
            // });

            if (data.recallHistory && data.recallHistory.thread){
                
                //PASS BOTH DATA HERE

                data.thread = data.recallHistory.thread; //using recalled thread to add as child item
                
                console.log('data.recallHistory found!! ',data.thread);

                newChildItem(data,data.recallHistory.thread,function(res){
                    data.thread = res;
                    console.log('new child thread ',res);
                });
            }else {

                console.log('data.recallHistory not found getting new recall');

                //no recallHistory found
                recallHistory(data,function(recalled){
                    console.log('RECALLED OBJECT ', recalled);
                    if (recalled && recalled.thread){
                        data.thread = recalled.thread; //using recalled thread to add as child item
                        newChildItem(data,function(res){
                            data.thread = res;
                            console.log('new child thread ',res);
                        });
                    }
                    else {
                        console.log('warning: recall and/or recall.thread not found')
                        newParentItem(function(res){
                            data.thread = res;
                            console.log('new parent thread ',res);
                        });                        
                    }

                });


            }
        }
    }else {
        console.log('non search ',data);

        //just create 2 item threads!

        //create new thread? thread goes back to a search bucket?
    }


    //THREAD FUNCTIONS ////

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

        console.log('childitem ',data.thread);
        data.thread.sequence++;
        console.log(data.thread.sequence);
        console.log('childitem2 ',data.thread);

        if (data.thread.isOpen == true){
            console.log('thread open');

            if (data.thread.id){

                //first item under parent, need to assign previous thread ID to parent
                if (data.thread.parent.isParent){
                    console.log('new parent id assigned to preceding item, now adding child id');
                    data.thread.parent.isParent = false;
                    data.thread.parent.id = data.thread.id; //assign preceding item in thread to parent id
                }     
                else {
                    console.log('adding another child id, parent id already created');
                }

                data.thread.id = shortid.generate(); //gen new idea for this item in thread

            }
            console.log('add new child thread ',data.thread.sequence);
            callback(data.thread);

            // else{
            // }

        }else if (data.thread.isOpen == false){
            console.log('thread closed');
        }
    }

    function updateThread(){

    }
    
    ///////// / / / / / / / / 



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

//create new mongo Message obj
var newMessage = function(data,callback){
    data = new Message(data);
    callback(data);
};


/////////// tools /////////////


/// exports
module.exports.saveHistory = saveHistory;
module.exports.recallHistory = recallHistory;
module.exports.newMessage = newMessage;