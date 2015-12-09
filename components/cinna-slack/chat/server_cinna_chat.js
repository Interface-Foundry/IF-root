var http = require('http');
var fs = require('fs');
var Bot = require('slackbots');
var async = require('async');
var amazon = require('./amazon-product-api_modified'); //npm amazon-product-api
stitch = require('../image_processing/api.js')
var nlp = require('../nlp/api');

//load kip modules
var banter = require("./components/banter.js");


var client = amazon.createClient({
  awsId: "AKIAILD2WZTCJPBMK66A",
  awsSecret: "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",
  awsTag: "kipsearch-20"
});

var createServerSnippet =  function(req, res) {
  fs.readFile("index.html", function(err, data) {
      res.end(data);
  }) ;
}

var app = http.createServer(createServerSnippet).listen(8000);
console.log("listening localhost:8000");


//globals
var messageHistory = {}; //fake database, stores all users and their chat histories


// - - - Slack create bot - - - -//
var settings = {
    token: 'xoxb-14750837121-mNbBQlJeJiONal2GAhk5scdU',
    name: 'cinna-1000'
};
var bot = new Bot(settings);

bot.on('start', function() {
    bot.on('message', function(data) {
        // all incoming events https://api.slack.com/rtm 
        // checks if type is a message & not the bot talking to itself (data.username !== settings.name)
        if (data.type == 'message' && data.username !== settings.name){ 
            var newSl = { 
                source: {
                    'origin':'slack',
                    'channel':data.channel,
                    'org':data.team              
                },
                'msg':data.text
            }
            preProcess(newSl);
        }

    });
});

//- - - - Socket.io handling - - - -//
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    console.log("socket connected");

    //SEND A WELCOME TO KIP MESSAGE HERE. how to get started

    socket.on("msgToClient", function(data) {
        data.source = { 
            'origin':'socket.io',
            'channel':socket.id,
            'org':'kip'
        }
        preProcess(data);
    });
});
//- - - - - - //


//pre process incoming messages for canned responses
function preProcess(data){

    //setting up all the data for this user / org
    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 1');
    }
    var indexHist = data.source.org + "_" + data.source.channel;
    if (!messageHistory[indexHist]){ //new user, set up chat states
        messageHistory[indexHist] = {};
        messageHistory[indexHist].search = []; //random chats
        messageHistory[indexHist].banter = []; //search
        messageHistory[indexHist].purchase = []; //finalizing search and purchase
        messageHistory[indexHist].persona = []; //learn about our user
        messageHistory[indexHist].cart = []; //user shopping cart
        messageHistory[indexHist].allBuckets = []; //all buckets, chronological chat history
    }

    //check for canned responses before routing to NLP
    banter.checkForCanned(data.msg,function(res){
        if(res){
            data.client_res = res;
            cannedBanter(data,res);
        }
        else {
            console.log('no');
            routeNLP(data); 
        }
    });
}

//pushing incoming messages to python
function routeNLP(data){

    nlp.parse(data.msg, function(e, res) {
        if (e){console.log('NLP error ',e)}
        else {

            console.log('NLP RES ',res);

            //- - - temp stuff to transfer nlp results to data object - - - //
            if (res.bucket){
                data.bucket = res.bucket;
            }
            if (res.action){
                data.action = res.action;
            }
            if (res.tokens){    
                data.tokens = res.tokens;
            }   
            if (res.searchSelect){    
                data.searchSelect = res.searchSelect;
            }  
            //- - - - end temp - - - - // 

            incomingAction(data);

        }

    })
}

//sentence breakdown incoming from python
function incomingAction(data){


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
        case 'supervisor':
            //route to supervisor chat window
            //JSON SEND TO SUPERVISOR
            // { 
            //   msg: 'more like 2',
            //   source: { 
            //     origin: 'socket.io',
            //     channel: '-lsQ0_8joP-Sp04JAAAA',
            //     org: 'kip' 
            //   },
            //   bucket: 'supervisor',
            //   searchSelect: [ 2 ],
            //   recallHistory: [{ 
            //     msg: 'xx',
            //     source: { 
            //       origin: 'socket.io',
            //       channel: '-lsQ0_8joP-Sp04JAAAA',
            //       org: 'kip' 
            //     },
            //     bucket: 'search',
            //     action: 'initial',
            //     tokens: [ 'xx' ],
            //     amazon:[ 
            //       ],
            //       client_res: 'Hi, here are some options you might like. Use "show more" to see more choices or "Buy X" to get it now :)',
            //       ts: Tue Dec 08 2015 15:29:15 GMT-0500 (EST) 
            //     }] 
            // }
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
        case 'modified': //because the nlp json is wack
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
        case 'smalltalk':
            outgoingResponse(data,'txt');
            saveHistory(data); //random stuff we chat with kip about
            break;
        default:
    }
}

function purchaseBucket(data){
    //sort purchase action
    switch (data.action) {
        case 'save':
            saveToCart(data);
            break;
        case 'remove':
            removeFromCart(data);
            break;
        case 'removeAll':
            removeAllCart(data);
            break;
        case 'list':
            listCart(data);
            break;
        case 'checkout':
            outputCart(data);
            break;
        default:
            console.log('error: no purchase bucket action selected');
    }

}


//* * * * * SEARCH ACTIONS * * * * * * * * //


function searchInitial(data,flag){

    console.log('search initial!');


    searchAmazon(data,'initial','none',flag);
}

function searchSimilar(data){

    //RECALL LAST ITEM IN SEARCH HISTORY
    recallHistory(data, function(item){ 
        data.recallHistory = item; //added recalled history obj to data obj
        searchAmazon(data,'similar');
    });
}

function searchModify(data, flag){

    //A child ASIN would be a blue shirt, size 16, sold by MyApparelStore
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/Variations_VariationDimensions.html

    // {   
    //     msg: '1 but in orange',
    //     source:{ 
    //         origin: 'socket.io',
    //         channel: 'dgUgwg_Z6hNp4qJIAAAB',
    //         org: 'kip' 
    //     },
    //     bucket: 'search',
    //     action: 'modified' 
    // }


    //temp!
    if (data.msg){
        data.tokens = [];
        data.tokens.push(data.msg);
    }

    //temp!
    if (!data.searchSelect){
        data.searchSelect = [1];
    }

    //temp!
    switch (true){
        case data.tokens[0].indexOf("in blue") !=-1 :

            data.dataModify = {
                type: 'color',
                val: ['blue']
            }     
            break;

        case data.tokens[0].indexOf("in XL") !=-1 :

            data.dataModify = {
                type: 'size',
                val: ['extra large','XL']
            } 
            break;   

        case data.tokens[0].indexOf("with collar") !=-1 :

            data.dataModify = {
                type: 'genericDetail',
                val: ['collar']
            }  
            break;  

        case data.tokens[0].indexOf("in wool") !=-1 :

            data.dataModify = {
                type: 'material',
                val: ['wool','cashmere','merino']
            }   
            break; 

        case data.tokens[0].indexOf("by Zara") !=-1 :

            data.dataModify = {
                type: 'brand',
                val: ['Zara']
            }   
            break;

        case data.tokens[0].indexOf("less than") !=-1 :

            data.dataModify = {
                type: 'price',
                param: 'less than',
                val: [25]
            } 
            break;   

        case data.tokens[0].indexOf("cheaper") !=-1 :

            data.dataModify = {
                type: 'price',
                param: 'less'
            }  
            break;
    }


    console.log('modified ',data);

    //RECALL LAST ITEM IN SEARCH HISTORY
    recallHistory(data, function(item){

        data.recallHistory = item;

        var cSearch = ''; //construct new search string

        //CONSTRUCT QUERY FROM AMAZON OBJECT
        if (data.recallHistory.amazon){

            if (data.dataModify && data.dataModify.type){
                //handle special modifiers that need care, consideration, hard tweaks of amazon search API
                switch (data.dataModify.type) {
                    case 'price':
                        searchInitial(data,{ // passing special FLAG for search to handle
                            'type':data.dataModify.type,
                            'param':data.dataModify.param,
                            'val':data.dataModify.val
                        });
                        break;

                    case 'brand':
                        searchInitial(data,{ // passing special FLAG for search to handle
                            'type':data.dataModify.type,
                            'val':data.dataModify.val
                        });
                        break;

                    default:
                        constructAmazonQuery(); //nm just construct a new query
                }               
            }
            else {
                console.log('error: data.dataModify params missing')
            }

            function constructAmazonQuery(){

                async.eachSeries(data.searchSelect, function(searchSelect, callback) {

                    var itemAttrib = data.recallHistory.amazon[searchSelect - 1].ItemAttributes; //get selected item attributes

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
                    if (itemAttrib[0].Binding){
                        cSearch = cSearch + ' ' + itemAttrib[0].Binding[0];
                    }

                    callback();
                }, function done(){
                    addModifier(); //done processing constructing new search, add modifier and run query
                });
            }
        }
        else {
            console.log('no Amazon data found in last history item. can not modify search');
            searchInitial(data); //do a search anyway
        }

        //after query construction, add modifier and fire search
        function addModifier(){

            //SORT WHICH TRAITS TO MODIFY
            switch (data.dataModify.type) {
                // CASES: color, size, price, genericDetail
                case 'color':

                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                case 'size':

                    //SORT THROUGH RESULTS OF SIZES, FILTER
                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                //texture, fabric, coating, etc
                case 'material':

                    //SORT THROUGH RESULTS OF SIZES, FILTER
                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                //unsortable modifier
                case 'genericDetail':

                    //SORT THROUGH RESULTS OF SIZES, FILTER
                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;
            }
        }

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


//save amazon item to cart
function saveToCart(data){

    data.bucket = 'search'; //modifying bucket to recall search history. a hack for now

    recallHistory(data, function(item){

        var indexHist = data.source.org + "_" + data.source.channel; //chat id

        //async push items to cart
        async.eachSeries(data.searchSelect, function(searchSelect, callback) {
            messageHistory[indexHist].cart.push(item.amazon[searchSelect - 1]); //add selected items to cart
            callback();
        }, function done(){
            //only support "add to cart" message for one item.
            //static:
            var sT = data.searchSelect[0];
            data.client_res = item.amazon[sT - 1].ItemAttributes[0].Title + ' added to your cart. Type <i>remove item</i> to undo.';
            outgoingResponse(data,'txt');
        });
    });
}

//Build Amazon Cart
function outputCart(data) {
    var indexHist = data.source.org + "_" + data.source.channel; //chat id

    var cartItems = [];

    //Input [{ASIN:xxx,Quantity:1},{...}]

    //async push items to cart
    async.eachSeries(messageHistory[indexHist].cart, function(item, callback) {

        cartItems.push({
            ASIN: item.ASIN,
            Quantity: 1
        });

        callback();
    }, function done(){
        //only support "add to cart" message for one item.
        //static:
        buildAmazonCart(cartItems);
    });

    function buildAmazonCart(items){
        console.log('items ',items);

        //construct amazon cart format
        var options = {};
        for (var i = 0; i < items.length; i++) {
            var propASIN = 'Item.'+i+'.ASIN';
            options[propASIN] = items[i].ASIN;
            var propQuan = 'Item.'+i+'.Quantity';
            options[propQuan] = items[i].Quantity;
        }

        client.createCart(options).then(function(results) {
            data.client_res = results.PurchaseURL[0];
            outgoingResponse(data,'txt');

        }).catch(function(err) {
            console.log(err);
            console.log(err.Error[0]);
            console.log('amazon err ', err[0].Error[0]);
        });
    }

}

//* * * * * * PROCESS ACTIONS * * * * * * * //



//searches Amazon
//(NEED TO MODIFY TO BE SEARCH PLATFORM AGNOSTIC -> modify search function per platform type, i.e. Kip search vs. Amazon search)
function searchAmazon(data, type, query, flag){

    //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
    //browsenode
    //keywords
    //maximum price
    //minimum price
    //related item page

    //* * * * * * * * *  NN CLASSIFICATION NEEDED * * * * * * * * //
    // & & & & & & & & & & & & & & & & & & & & & & & & & & & & & &//
    // * * * * CLASSIFY incoming searches into categories --> search amazon with BrowseNode ---> better results

    //sort query type
    switch (type) {
        case 'initial':

            //add some amazon query params
            var amazonParams = {};
            amazonParams.Keywords = data.tokens[0]; //text search string
            amazonParams.responseGroup = 'ItemAttributes,Offers,Images';

            //check for flag to modify amazon search params
            if (flag && flag.type){ //search modifier

               console.log('search flag ',flag);

                //parse flags
                if (flag.type == 'price'){

                    switch (flag.param) {
                        case 'less':

                            //there's a price for the item
                            if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[0].ItemAttributes[0].ListPrice[0].Amount[0]){

                                var newPrice = 0;

                                //summoning original query obj. loop searchSelect [ ]
                                async.eachSeries(data.searchSelect, function(searchSelect, callback) {
                                    //adding up prices for each item
                                    newPrice = newPrice + data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].ListPrice[0].Amount[0];

                                    callback();
                                }, function done(){
                                    console.log('processing 1 ',newPrice);

                                    // calculate average price and decrease by 25%
                                    newPrice = newPrice / data.searchSelect.length; //average the price
                                    var per = newPrice * .35; //get 25% of price
                                    newPrice = newPrice - per; // subtract percentage
                                    newPrice = Math.round(newPrice); //clean price
                                    // if (newPrice > 1){
                                    //     newPrice = Math.floor(newPrice / 1e11); //remove ¢, keep $
                                    // }
                                    if (newPrice > 0){
                                        //add price param
                                        amazonParams.MaximumPrice = newPrice.toString();

                                        console.log('processing ',newPrice);

                                        //now resolving the search term param
                                        if (data.searchSelect.length == 1){
                                           var searchSelect = data.searchSelect[0];
                                           amazonParams.Keywords = data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title;
                                           console.log('USING SELECTED ITEM ',amazonParams.Keywords);
                                        }
                                        else {
                                            console.log('Warning: no single item selected for less (not supporting multiple), so resorting to less N original query from user')
                                            var searchSelect = data.searchSelect[0];
                                            amazonParams.Keywords = data.recallHistory.tokens[0];
                                            console.log('USING ORIGINAL SEARCH ',amazonParams.Keywords);

                                        }
                                        amazonParams.Keywords = data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title;
                                    }
                                    else {
                                        console.log('Error: not allowing search for max price below 0');
                                    }
                                });
 
                            }
                            else {
                                console.log('error: amazon price missing');
                            }

                            break;

                        case 'less than':
                            console.log('less than');

                            //check if val is real number
                            if (flag.val && isNumber(flag.val[0])){

                                console.log('FIRING less than ',data.searchSelect.length);

                                //WARNING: THIS SUCKS AND IS INACCURATE / TOO SPECIFIC OF A QUERY RIGHT NOW. USE WEAK SEARCHER

                                //user wanted one item at different price

                                if (data.searchSelect.length == 1){

                                    var searchSelect = data.searchSelect[0];

                                    if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title){
                                        amazonParams.Keywords = data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title;

                                        amazonParams.MaximumPrice = flag.val[0];
                                        amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                                        amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal


                                        console.log('params ',amazonParams);
                                    }
                                    else {
                                        console.log('Error: Title is missing from amazon itemattributes object');
                                    }

                                }
                                else {
                                    console.log('Warning: no single item selected for less than (not supporting multiple), so resorting to less than N original query from user')
                                    amazonParams.MaximumPrice = flag.val[0];
                                    amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                                    amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal
                                    amazonParams.Keywords = data.recallHistory.tokens[0];
                                }
                            }
                            else {
                                console.log(' number not used in flag.val with flag.modify == price');
                            }
                            break;
                        case 'more':

                            break;
                        case 'more than':
                            break;

                        default:
                            console.log('error: no flag.param found with flag.modify == price');
                    }
                }
                else if (flag.type == 'brand'){
                    console.log('BRAND FIRED');
                }
            }

            //AMAZON BASIC SEARCH
            client.itemSearch(amazonParams).then(function(results){

              data.amazon = results;

              outgoingResponse(data,'stitch','amazon'); //send back msg to user

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

        // * * * * * * * * * * * * * *//

        case 'similar':
            //handle no data error
            if (!data){
                console.log('error no amazon item found for similar search');

                var msg = 'Sorry, I don\'t understand, please ask me again';
                cannedBanter(data,msg);
                //outgoingResponse(data,'txt');
            }
            else {

                if (data.recallHistory.amazon){ //we have a previously saved amazon session

                    if (!flag){ //no flag passed in
                        flag = 'Intersection'; //default
                    }

                    //GATHER AMAZON IDS FROM USER SEARCH SELECTIONS
                    var IdArray = [];
                    for (var i = 0; i < data.searchSelect.length; i++) { //match item choices to product IDs
                        var searchNum = data.searchSelect[i];
                        IdArray.push(data.recallHistory.amazon[searchNum - 1].ASIN[0]);
                    }
                    var ItemIdString = IdArray.toString();
                    //////////

                    //AMAZON SIMILARITY QUERY
                    // [NOTE: functionality not in default AWS node lib. had to extend it!]
                    client.similarityLookup({
                      ItemId: ItemIdString, //get search focus items (can be multiple) to blend similarities
                      //Keywords: data.recallHistory.tokens,
                      SimilarityType: flag, //other option is "Random" <<< test which is better results
                      responseGroup: 'ItemAttributes,Offers,Images'

                    }).then(function(results){

                        //console.log('RESULTS SIMILAR ',results);

                        data.amazon = results;

                        //* * * * * CHANGE TO INITIAL SERACH FORMAT * * * * //
                        outgoingResponse(data,'stitch','amazon'); //send msg to user

                        //need to put results inside data

                        //saveHistory(data,results,'amazon'); //push new state, pass amazon results

                    }).catch(function(err){
                      console.log('amazon err ',err[0].Error[0]);
                      console.log('SIMILAR FAILED: should we fire random query or mod query');
                      //searchAmazon(data, type, query, 'Random'); //if no results, retry search with random
                    });
                }
                else {
                    searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search instead
                }
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

/////////// OUTGOING RESPONSES ////////////


//process canned message stuff
//data: kip data object
//req: incoming message from user
function cannedBanter(data,req){
    data.bucket = 'banter';
    data.action = 'smalltalk';
    //if this is pre-process chat (before NLP), store incoming chat msg too
    if(req){
        data.tokens = [];
        data.tokens.push(req);       
    }
    banterBucket(data);
}

//Constructing reply to user
function outgoingResponse(data,action,source){ //what we're replying to user with
    var numEmoji;
    //stitch images before send to user
    if (action == 'stitch'){
        stitchResults(data,source,function(url){

            data.client_res = url;
            saveHistory(data); //push new history state after we have stitched URL
            sendResponse(data);

            //* * * * * * * * * *
            //which cinna response?
            //* * * * * * * * * * *

            //convert select num to emoji based on data source
            if (data.searchSelect){
                switch(data.searchSelect[0]){
                    case 1:
                        if (data.source.origin == 'socket.io'){
                            numEmoji = '<span style="font-size:32px;">➊</span>';
                        }
                        else if (data.source.origin == 'slack'){
                            numEmoji = ':one:';
                        }
                        break;
                    case 2:
                        if (data.source.origin == 'socket.io'){
                            numEmoji = '<span style="font-size:32px;">➋</span>';
                        }
                        else if (data.source.origin == 'slack'){
                            numEmoji = ':two:';
                        }
                        break;
                    case 3:
                        if (data.source.origin == 'socket.io'){
                            numEmoji = '<span style="font-size:32px;">➌</span>';
                        }
                        else if (data.source.origin == 'slack'){
                            numEmoji = ':three:';
                        }
                        break;
                }
            }
            switch (data.bucket) {
                case 'search':
                    switch (data.action) {
                        case 'initial':
                            data.client_res = 'Hi, here are some options you might like. Use "show more" to see more choices or "Buy X" to get it now :)';
                            outgoingResponse(data,'txt'); 
                            break;
                        case 'similar':
                            data.client_res = 'We found some options similar to '+numEmoji+', would you like to see their product info? Use "info X" or help for more options';
                            outgoingResponse(data,'txt'); 
                            break;
                        case 'modify':
                        case 'modified': //because the nlp json is wack
                            switch (data.dataModify.type) {
                                case 'price':
                                    if (data.dataModify.param == 'less'){
                                        data.client_res = 'Here you go! Which do you like best? Use "more like x" to find similar or help for more options';
                                        outgoingResponse(data,'txt'); 
                                    }
                                    else if (data.dataModify.param == 'less than'){
                                        data.client_res = 'Definitely! Here are some choices less than $'+data.dataModify.val+', would you like to see the product info? Use "info x" or help for more options';
                                        outgoingResponse(data,'txt'); 
                                    }
                                    break;
                                case 'brand':
                                    data.client_res = ' Here you go! Which do style you like best? Use "more like x" to find similar or help for more options';
                                    outgoingResponse(data,'txt'); 
                                    break;
                                default:
                                    console.log('warning: no modifier response selected!');
                            }     
                            break;
                        case 'focus':
                            //SET 1 MINUTE TIMEOUT HERE
                            data.client_res = 'focus';
                            outgoingResponse(data,'txt'); 
                            break;
                        case 'back':
                            data.client_res = 'back';
                            outgoingResponse(data,'txt'); 
                            break;
                        case 'more':
                            data.client_res = 'more';
                            outgoingResponse(data,'txt'); 
                            break;
                        default:
                            console.log('warning: no search bucket action selected');
                    }
                    break;
                case 'purchase':
                        switch (data.action) {
                            case 'save':
                                data.client_res = 'I\'ve added this item to your cart :) Use "Get" anytime to checkout or "help" for more options';
                                outgoingResponse(data,'txt'); 
                                break;
                            case 'removeAll':
                                data.client_res = 'All items removed from your cart. To start a new search type "find (item)"';
                                outgoingResponse(data,'txt'); 
                                break;
                            case 'list':
                                data.client_res = 'Here\'s everything you have in your cart :) Use Get anytime to checkout or help for more options';
                                outgoingResponse(data,'txt'); 
                                break;
                            case 'checkout':
                                data.client_res = 'Great! Please click the link to confirm your items and checkout. {{link}} Thank you:)';
                                outgoingResponse(data,'txt'); 
                                break;
                            default:
                                console.log('warning: no purchase bucket action selected');
                        }
                    break;

                default:
                    console.log('warning: no bucket selected');
            }

        });
    }
    //single image msg to user
    else if (action == 'txt'){
        sendResponse(data);
    }
    //single image msg to user
    else if (action == 'image'){
        sendResponse(data);
    }
    //one default image msg to user
    else {
        sendResponse(data);
    }
}

function sendResponse(data){
    if (data.source.origin == 'socket.io'){
        io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res});
    }
    else if (data.source.origin == 'slack'){
        //eventually cinna can change emotions in this pic based on response type
        var params = {
            icon_url: 'http://kipthis.com/img/kip-icon.png'
        }
        bot.postMessage(data.source.channel, data.client_res, params);  
        
    }
}


////////////// PROCESS IMAGES ///////////////

//stitch 3 images together into single image
function stitchResults(data,source,callback){
    //rules to get 3 image urls
    switch (source) {
        case 'amazon':
            //adding images for stiching
            var toStitch = [];
            var loopLame = [0,1,2];//lol

            async.eachSeries(loopLame, function(i, callback) {
                if (data.amazon[i].MediumImage && data.amazon[i].MediumImage[0].URL[0]){
                    
                    var price;

                    if (!data.amazon[i].ItemAttributes[0].ListPrice){
                        price = ''; //price missing, show blank
                    }
                    else{
                        price = data.amazon[i].ItemAttributes[0].ListPrice[0].Amount[0];
                        price = addDecimal(price);
                    }

                    toStitch.push({
                        url: data.amazon[i].MediumImage[0].URL[0],
                        price: price,
                        name: truncate(data.amazon[i].ItemAttributes[0].Title[0]) //TRIM NAME HERE 
                    });
                }
                callback();
            }, function done(){
                fireStitch(); 
            });
            break;
    }
    function fireStitch(){
        //call to stitch service
        stitch(toStitch, function(e, stitched_url){
            if(e){
                console.log('stitch err ',e);
            }
            callback(stitched_url);
        })        
    }
}


////////////// HISTORY ACTIONS ///////////////

//store chat message in history
function saveHistory(data,type){

    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 2');
    }
    
    var indexHist = data.source.org + "_" + data.source.channel; //create id
    
    data.ts = new Date(); //adding timestamp
    
    if (!messageHistory[indexHist]){
        console.log('error: user doesnt exist in memory storage');
    }
    else {
        switch (data.bucket) {
            case 'search':
                messageHistory[indexHist].search.push(data);
                break;
            case 'banter':
                messageHistory[indexHist].banter.push(data);
                break;
            case 'purchase':
                messageHistory[indexHist].purchase.push(data);
            default:
        }
        messageHistory[indexHist].allBuckets.push(data);
    }

}

//get user history
function recallHistory(data,callback,steps){
    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 3');
    }
    var indexHist = data.source.org + "_" + data.source.channel;

    //if # of steps to recall
    if (!steps){
        var steps = 1;
    }
    //get by bucket type
    switch (data.bucket) {
        case 'search':
            var arrLength = messageHistory[indexHist].search.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[indexHist].search[arrLength]); //get last item in arr
            break;
        case 'banter':
            var arrLength = messageHistory[indexHist].banter.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[indexHist].banter[arrLength]); //get last item in arr
            break;
        case 'purchase':
            var arrLength = messageHistory[indexHist].purchase.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[indexHist].purchase[arrLength]); //get last item in arr
        default:
    }

}




///////////////////////////////////////////
//////////  tools /////////////////
//////////////////////////////////////////

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//trim a string to char #
function truncate(string){
   if (string.length > 60)
      return string.substring(0,60)+'...';
   else
      return string;
};

function addDecimal(str) {
    var output;
    var num = parseInt(str);
    num = num * .10 * .10; //move decimal
    num = Math.round(num * 100) / 100; //remove extra decimal
    output = "$" + num.toString();
    return output;
}
