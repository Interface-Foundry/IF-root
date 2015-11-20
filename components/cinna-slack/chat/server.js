var http = require('http');
var fs = require('fs');
var amazon = require('./amazon-product-api_modified'); //npm amazon-product-api
stitch = require('../image_processing/api.js')
var nlp = require('../nlp/api');

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

        //FUNCTION WITH CALLBACK TO PYTHON, CALLBACK PASSES DATA TO incomingAction():
        routeNLP(data.msg); //also send channel ID of slack user

    })
});

function routeNLP(msg){ //pushing incoming messages to python

    nlp.parse(msg, function(e, res) {
        //TODO
        res.channel = '3EL18A0M'

        //TEMPORARY TODO
        // nlp doesn't handle these yet
        if (msg == 'similar'){
            res.action = 'similar';
            res.searchSelect = [1]
            res.tokens = msg;
        }
        else if (msg == 'modify'){
            res.action = 'modify';
            res.searchSelect = [1]
            res.tokens = msg;
        }
        else if (msg == 'focus'){
            res.action = 'focus';
            res.searchSelect = [1]
            res.tokens = msg;
        }

        incomingAction(res)
    })
}

//sentence breakdown incoming from python
function incomingAction(data){ 

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
        case 'back':
            searchBack(data);
            break;
        case 'more':
            searchMore(data); //Search more from same query
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


function searchInitial(data,flag){

    searchAmazon(data,'initial','none',flag);
}

function searchSimilar(data){

    //RECALL LAST ITEM IN SEARCH HISTORY
    recallHistory(data, function(item){
        //SIMILAR SEARCH AMAZON API
        searchAmazon(item,'similar',data);
    });
}

function searchModify(data, flag){

    //RECALL LAST ITEM IN SEARCH HISTORY
    recallHistory(data, function(item){

        //mock parsed sentence data from python
        var dataModify = 'color';
        var newColor = 'blue';
        var newTexture = 'wool';
        var newSize = 'XL';

        var cSearch = ''; //construct new search string

        //amazon obj exists in recalled item
        if (item.amazon){

            for (var i = 0; i < data.searchSelect; i++) { //for items user is interested in

                var searchSelect = data.searchSelect[i]; //get item selected
                var itemAttrib = item.amazon[searchSelect - 1].ItemAttributes; //get selected item attributes

                //cSearch = cSearch + itemAttrib[0].Title[0]; //add in full title of item
                //^ parse above into token, sort priority??

                //DETAILED SEARCH, FIRED IF FLAG weakSearch not on
                if (flag !== 'weakSearch'){
                    console.log('weakSearch FALSE');
                    //add brand 
                    if (itemAttrib[0].Brand){ 
                        cSearch = cSearch + ' ' + itemAttrib[0].Brand[0];
                    }
                    //add clothing size
                    if (itemAttrib[0].ClothingSize){
                        cSearch = cSearch + ' ' + itemAttrib[0].ClothingSize[0];
                    }
                }
                else {
                    console.log('weakSearch TRUE');
                }

                if (itemAttrib[0].Department){
                    cSearch = cSearch + ' ' + itemAttrib[0].Department[0];
                }
                if (itemAttrib[0].ProductGroup){
                    cSearch = cSearch + ' ' + itemAttrib[0].ProductGroup[0];
                }
                if (itemAttrib[0].ProductTypeName){
                    cSearch = cSearch + ' ' + itemAttrib[0].ProductTypeName[0];
                }
                if (itemAttrib[0].ProductGroup){
                    cSearch = cSearch + ' ' + itemAttrib[0].ProductGroup[0];
                }
                if (itemAttrib[0].Binding){
                    cSearch = cSearch + ' ' + itemAttrib[0].Binding[0];
                }

               // console.log(itemAttrib[0]);

                //SORT WHICH TRAITS TO MODIFY
                switch (dataModify) {

                    // CASES: color, size, price, genericDetail (texture, material, brand, etc.)

                    case 'color':

                        cSearch = newColor + ' ' + cSearch; //add new color
                        data.tokens = cSearch; //replace search string in data obj
                        searchInitial(data,flag); //do a new search

                        break;

                }




            }
        }
        else {
            console.log('no Amazon data found in last history item. can not modify search');
            searchInitial(data); //do a search anyway
        }


        // //SIMILAR SEARCH AMAZON API
        // searchAmazon(item,'initial',data);
    });

}

function searchFocus(data){

}

function searchMore(data){
    //go to end of search results array (3 at a time). if hit end of search array V
    //use amazon search itemPage to advance to more results
}

function searchBack(data){
    //SKIP BACK to history items (use recallHistory w. # of steps == 2)
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
                searchSelect:data.searchSelect,
                tokens:data.tokens,
                ts: new Date(),
                // ts: data.ts, //timestamp
                // user: data.user, //user id
                // text: data.text, //message
                // team: data.team, //team id
                // context: context, //our first convo
                // searchState: searchState,
                // botResponse: botResponse
            });

            //store history with results from amazon
            if (type == 'amazon'){
                var histLength = messageHistory[data.channel].search.length - 1; //retrieve position of history item in arr
                messageHistory[data.channel].search[histLength].amazon = [];
                for (var i = 0; i < results.length; i++) { //adding amazon results to hist
                     messageHistory[data.channel].search[histLength].amazon.push(results[i]);
                }
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
function recallHistory(data,callback,steps){

    //if # of steps to recall
    if (!steps){
        var steps = 1;
    }
    //get by bucket type
    switch (data.bucket) {
        case 'search':
            var arrLength = messageHistory[data.channel].search.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.channel].search[arrLength]); //get last item in arr
            break;
        case 'banter':
            var arrLength = messageHistory[data.channel].banter.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.channel].banter[arrLength]); //get last item in arr
            break;
        case 'purchase':
            var arrLength = messageHistory[data.channel].purchase.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.channel].purchase[arrLength]); //get last item in arr
        default:
    }

}
///////////////////////////////////////////


//searches Amazon 
//(NEED TO MODIFY TO BE SEARCH PLATFORM AGNOSTIC -> modify search function per platform type, i.e. Kip search vs. Amazon search)
function searchAmazon(data, type, query, flag){

    //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
    //browsenode
    //keywords
    //maximum price
    //minimum price
    //related item page

    switch (type) {
        case 'initial':

            //IDEAS:
            //MODIFY searchIndex if persona weight > x\
            //IDENTIFY BRAND NAME TO SEARCH BY BRAND?

            //AMAZON BASIC SEARCH
            client.itemSearch({
              // searchIndex: 'DVD',
              Keywords: data.tokens,
              responseGroup: 'ItemAttributes,Offers,Images'

            }).then(function(results){
              outgoingResponse(results,'stitch','amazon'); //send back msg to user
              saveHistory(data,results,'amazon'); //push new state, pass amazon results

            }).catch(function(err){

                //handle err codes. do stuff.
                if (err[0].Error[0].Code[0]){
                    switch (err[0].Error[0].Code[0]) {

                        //CASE: No results for search
                        case 'AWS.ECommerceService.NoExactMatches':
                            //do a weak search
                            weakSearch(data,type,query,flag); 
                            break;

                        default:
                            console.log('amazon err ',err[0].Error[0]); 
                    }                  
                }                 
            });

            break;

        case 'similar':

            if (data.amazon){ //we have a previously saved amazon session
                
                if (!flag){ //no flag passed in
                    flag = 'Intersection';
                }

                //GATHER AMAZON IDS FROM USER SEARCH SELECTIONS
                var IdArray = [];
                for (var i = 0; i < query.searchSelect.length; i++) { //match item choices to product IDs
                    var searchNum = query.searchSelect[i];
                    IdArray.push(data.amazon[searchNum - 1].ASIN[0]);
                }
                var ItemIdString = IdArray.toString();
                //////////

                //AMAZON SIMILARITY QUERY 
                // [NOTE: functionality not in default AWS node lib. had to extend it!]
                client.similarityLookup({
                  ItemId: ItemIdString, //get search focus items (can be multiple) to blend similarities
                  Keywords: data.tokens,
                  SimilarityType: flag, //other option is "Random" <<< test which is better results
                  responseGroup: 'ItemAttributes,Offers,Images'

                }).then(function(results){
                    outgoingResponse(results,'stitch','amazon'); //send msg to user
                    saveHistory(data,results,'amazon'); //push new state, pass amazon results

                }).catch(function(err){
                  console.log('amazon err ',err[0].Error[0]);
                  console.log('SIMILAR FAILED: should we fire random query or mod query');
                  //searchAmazon(data, type, query, 'Random'); //if no results, retry search with random
                });
            }
            else {
                searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search instead
            }

            break;

        case 'focus':
            break;
        default:
    }


}

//re-search but with less specific terms
function weakSearch(data,type,query,flag){
    //sort incoming flags for redundant searches
    switch (flag) {
        case 'weakSearch': //we already did weakSearch
            console.log('ALREADY TRIED weakSearch FLAG!');
            console.log('HANDLE weaker Search here');
            break;
        default:
            //no results, trying weak search
            console.log('no results');

            //select weakSearch action (initial, modify, etc)
            switch (data.action) { 
                case 'modify':
                    searchModify(data, 'weakSearch');
                    break;
                default:
                    console.log('weak search not enabled for '+ data.action);
            }       
    }
}

function outgoingResponse(data,action,source){ //what we're replying to user with

    //stitch images before send to user
    if (action == 'stitch'){
        stitchResults(data, source,function(url){
            io.sockets.emit("msgFromSever", {message: url});
        });
    }
    else {
        io.sockets.emit("msgFromSever", {message: data[0].LargeImage[0].URL[0]});
    }
}

//stitch 3 images together into single image
function stitchResults(data,source,callback){
    //rules to get 3 image urls
    switch (source) {
        case 'amazon':
            //adding images for stiching
            var toStitch = [];

            for (var i = 0; i < 3; i++) {
                if (data[i].MediumImage && data[i].MediumImage[0].URL[0]){
                    toStitch.push(data[i].MediumImage[0].URL[0]);
                }
            }
            break;
    }
    //call to stitch service
    stitch(toStitch, function(e, stitched_url){
        if(e){
            console.log('stitch err ',e);
        }
        callback(stitched_url);
    })
}


function addToCart(){

}

function outputCart(){

    //Pass array of ASIN with quanities to Mitsu cart

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
