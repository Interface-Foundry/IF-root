var http = require('http');
var fs = require('fs');
var amazon = require('./amazon-product-api_modified'); //npm amazon-product-api
stitch = require('../image_processing/api.js')

var client = amazon.createClient({
  awsId: "AKIAILD2WZTCJPBMK66A",
  awsSecret: "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",
  awsTag: "kipsearch-20"
});

var createServerSnippet =  function(req, res) {
  fs.readFile("index.html", function(err, data ) {
      res.end(data);
  }) ;
}

var app = http.createServer(createServerSnippet).listen(8000);
console.log("listening localhost:8000");

var messageHistory = {};

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    console.log("socket connected");

    socket.on("msgToClient", function(data) {

        routeNLP(data.msg); //also send channel ID of slack user
        
    })
});



function routeNLP(msg){ //pushing incoming messages to python
    
    //SENDING (msg) MESSAGE TO PYTHON:
    //http request, wait for response, push to incomingAction()
    var sampleRes = {
        bucket: 'search',
        action: 'initial',
        searchSelect: [2], //which item for search selct
        tokens: msg,
        channel: '3EL18A0M' //example of slack channel (the user who is chatting) --> please send back from python
    };

    //ON PYTHON RESPONSE, PROCESS 
    incomingAction(sampleRes);
}

function incomingAction(data){ //sentence breakdown incoming from python

    //***** SAVE INCOMING STATE ******//
    //INCOMING DATA FROM SLACK (data obj in SLACK INCOMING MESSAGE)
    //var chatChannel = data.channel;
    if (!messageHistory[data.channel]){ //new user, set up chat states
        messageHistory[data.channel] = {};
        messageHistory[data.channel].search = []; //random chats
        messageHistory[data.channel].banter = []; //search 
        messageHistory[data.channel].purchase = []; //finalizing search and purchase
        messageHistory[data.channel].persona = []; //learn about our user
    }
    //* * * * * * * * * * * * * * * * //

    //sort context bucket (search vs. banter vs. purchase)
    switch (data.bucket) {
        case 'search':  
            searchBucket(data);
            break;        
        case 'banter':  
            banterBucket(data);
            break; 
        case 'purchase':  
            purchaseBucket(data);
            break; 
        default:
            searchBucket(data);
    }

}

//* * * * * ACTION CONTEXT BUCKETS * * * * * * *//

function searchBucket(data){

    //sort search action type
    switch (data.action) {
        case 'initial':  
            searchInitial(data);
            break;        
        case 'similar':
            searchSimilar(data);
            break;
        case 'modify':
            searchModify(data);
            break;
        case 'focus':
            searchFocus(data);
            break;
        default:
            searchInitial(data);
    }

}

function banterBucket(data){
    //sort search action type
    switch (data.action) {
        case 'question':  
            break;        
        default:
    }
}

function purchaseBucket(data){
    //sort search action type
    switch (data.action) {
        case 'save':  
            break;        
        default:    
    }
}

//* * * * * SEARCH ACTIONS * * * * * * * * //

    //* * * * * * * * *
    //BUCKET 1: Search
    //* * * * * * * * *

    //INITIAL QUERY: 
    //kip find me running leggings --> /* CONSULT USER HISTORY OF SEARCH (persona?) ---> SEARCH ---> RETURN ANSWER
    //kip find me a hat --> /* CONSULT USER HISTORY OF SEARCH (persona?) ---> SEARCH ---> RETURN ANSWER
    //kip find me hats --> /* CONSULT USER HISTORY OF SEARCH (persona?) ---> SEARCH ---> RETURN ANSWER
    //looking for a black zara jacket ---> SEARCH ---> RETURN ANSWER


    //QUERY SIMILAR to N(+N):
    //more like 1 (N = 1++) --> similar item search --> RETURN ANSWER


    //MODIFY N(+N):
    //like the first one but orange (N = 1, but orange [physical] ) ---> add orange tag, remove other color tags ---> search ---> RETURN ANSWER
    //like 2 but with a crown decal (N = 2, but crown-decal [physical] ) ---> add crown decal tags ---> search ---> RETURN ANSWER
    //a budweiser crown decal (HISTORICAL MODIFY N = 2 (since no new instructions, find logic in past), [+budweiser] crown decal [physical]) ---> search ---> RETURN ANSWER
    //do you have 2 but in blue (N = 2, but in blue [physical]) ---> add blue tag, remove other color tags ---> search ---> RETURN ANSWER
    //please show brighter blue i don't like dark colour (N = 1,2,3, but in lighter blues) ---> add blue/baby blue/powder blue/light blue ---> search ---> RETURN ANSWER


    //FOCUS N(+N):
    //does the first one have pockets? (N = 1) [USER QUESTION FLAG] ---> Find item detail FUNCTION, parse sentence area most likely to answer question ----> RETURN ANSWER
    //1 is perfect, how much is it? (N = 1, price focus) ---> Find item PRICE function ---> RETURN ANSWER
    //hmm I really like 3 what's the fabric? (N = 3, [physical] texture focus) ---> Find item FABRIC function ----> RETURN ANSWER
    //I like the third one (N = 3, detail focus. INTERESTED flag) ---> Find item detail snippet ---> ATTACH SALES PUSH (ADD TO CART) ---> RETURN ANSWER
    // ^ SAME AS: third / 3 ---> SAME ^
    //is there any size medium? (HISTORICAL FOCUS N = 3 [USER QUESTION FLAG]) ---> Find if Medium of item ---> IF(item == M){return item detail, ASK FOR CART ADD} ELSE {MODIFY N SIMILAR ITEM IN MEDIUM SIZE}


function searchInitial(data){

    searchAmazon(data,'initial');
}

function searchSimilar(data){

    //RECALL LAST ITEM IN SEARCH HISTORY
    recallHistory(data, function(item){

        //SIMILAR SEARCH AMAZON API
        searchAmazon(item,'similar');

    });


}

function searchModify(data){

    //

}

function searchFocus(data){

}

//* * * * * BANTER ACTIONS * * * * * * * * //

    //* * * * * * * * *
    //BUCKET 2: Banter
    //* * * * * * * * *
    //how shall i respond?

//* * * * * * ORDER ACTIONS * * * * * * * * //

    //* * * * * * * * * *
    //BUCKET 3: Ordering
    //* * * * * * * * * * 
    //what order state are we in?
    // save 1 ---> store item in cart ---> RETURN "SAVED FOR LATER"
    // save all ---> 
    // view cart ---> get all items in cart ---> RETURN CART? or return URL TO amazon?
    // would you like me to get it for you? [kip question flag, wait for response] (PHASE 2)


//* * * * * * PROCESS ACTIONS * * * * * * * //



////////////// HISTORY ACTIONS ///////////////

//store chat message in history
function saveHistory(data,results,type){
    switch (data.bucket) {
        case 'search':  
            messageHistory[data.channel].search.push({ 
                channel:data.channel,
                bucket:data.bucket,
                action:data.action,
                tokens:data.tokens,
                ts: new Date()
                // ts: data.ts, //timestamp
                // user: data.user, //user id
                // text: data.text, //message
                // team: data.team, //team id
                // context: context, //our first convo
                // searchState: searchState,
                // botResponse: botResponse
            });
            if (type && type =='amazon'){ //store history with results from amazon
                messageHistory[data.channel].search.amazon = results[0];
                console.log(messageHistory[data.channel].search);
            }
            break;   
        case 'banter':
            messageHistory[data.channel].banter.push({ 
                ts: data.ts, //timestamp
                user: data.user, //user id
                text: data.text, //message
                team: data.team, //team id
                context: context, //our first convo
                searchState: searchState,
                botResponse: botResponse
            });
            break;
        case 'purchase':
            messageHistory[data.channel].purchase.push({ 
                ts: data.ts, //timestamp
                user: data.user, //user id
                text: data.text, //message
                team: data.team, //team id
                context: context, //our first convo
                searchState: searchState,
                botResponse: botResponse
            });    
        default:
    }

}

//get user history
function recallHistory(data,callback){
    //get by bucket type
    switch (data.bucket) {
        case 'search':  
            var arrLength = messageHistory[data.channel].search.length-1;
            callback(messageHistory[data.channel].search[arrLength]); //get last item in arr
            break;   
        case 'banter':
            var arrLength = messageHistory[data.channel].banter.length-1;
            callback(messageHistory[data.channel].banter[arrLength]); //get last item in arr
            break;
        case 'purchase':
            var arrLength = messageHistory[data.channel].purchase.length-1;
            callback(messageHistory[data.channel].purchase[arrLength]); //get last item in arr
        default:
    }
}
///////////////////////////////////////////


function searchAmazon(data, type){

    switch (type) {
        case 'initial':  

            client.itemSearch({  
              // searchIndex: 'DVD',
              Keywords: data.tokens,
              responseGroup: 'ItemAttributes,Offers,Images'
            }).then(function(results){

                //console.log('AMAZON ',results);
                console.log('AMAZON ',results[0].ItemAttributes[0]);

              outgoingResponse(results);

              saveHistory(data,results,'amazon'); //push new state, pass amazon results 

            }).catch(function(err){

              console.log('amazon err ',err[0].Error[0]);
            });   

            break;   

        case 'similar':

            if (data.amazon && data.amazon.itemId){ //we have a previously saved amazon session

                client.similarityLookup({  
                  // searchIndex: 'DVD',
                  ItemId: data.amazon[2 - 1].ASIN[0], //get search focus item
                  Keywords: data.tokens,
                  responseGroup: 'ItemAttributes,Offers,Images'
                }).then(function(results){

                  outgoingResponse(results);
                }).catch(function(err){
                    saveHistory(data); //push new state

                  console.log('amazon err ',err[0].Error[0]);
                });   

                //MERGE N(+N) ITEMS WITH AMAZON COMBINED ID SEARCH: SimilarityType
                //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SimilarityLookup.html

            }
            else {
                searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search
            }



            break;
        case 'modify':

            break;
        case 'focus':
            con
        default:
    }

    //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
    //browsenode
    //keywords
    //maximum price
    //minimum price
    //related item page

    //* * * * * PARSING searchIndex for PERSONA * * * * * * * * * * * * * * * * * *//
    //searchIndex (CATEGORY)
    //CASE: generic search for clothing / accessory without "men" or "women"
    //-----------> refer to M to W weightage in USER PERSONA cache [5,1] (# of times searched with men vs. women in query. log each query and ++ to PERSONA array)


}


    
function outgoingResponse(res){ //what we're replying to user with

    //STITCH RESULTS (data,function(url)){ }

    io.sockets.emit("msgFromSever", {message: res[0].LargeImage[0].URL[0]});
}

function stitchResults(data,callback){
    //stitch(['http://url1.png', ...], function(e, stitched_url){})
}




function addToCart(){

}

function outputCart(){

}


function query(){

}

function modify(){

}

function focus(){

}


function respond(){

}

function search(){

}

function addCart(){

}