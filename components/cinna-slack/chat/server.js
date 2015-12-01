var http = require('http');
var fs = require('fs');
var async = require('async');
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

        //rough banter framework, use flat file DB or redis?
        switch (data.msg) {
            case 'hi':
                data.msg = 'HELLO! oops caps';
                outgoingResponse(data,'txt'); //
                break;
            case 'sup':
                data.msg = 'nm, u?';
                outgoingResponse(data,'txt'); //
                break;
            case 'are you a bot':
                data.msg = 'yep, are you human?';
                outgoingResponse(data,'txt');
                break;
            case 'what\'s the meaning of life?':
                data.msg = 'life, the multiverse and whatever';
                outgoingResponse(data,'txt');
                break;
            case 'how do i shot web?':
                data.msg = 'https://memecrunch.com/image/50e9ea9cafa96f557e000030.jpg?w=240';
                outgoingResponse(data,'image');
                break;
            case 'u mad bro?':
                data.msg = 'http://ecx.images-amazon.com/images/I/41C6NxhQJ0L._SY498_BO1,204,203,200_.jpg';
                outgoingResponse(data,'image');
                break;
            case 'How Is babby formed?':
                data.msg = 'girl get pragnent';
                outgoingResponse(data,'txt');
                break;
            case 'Drink Me':
                data.msg = 'http://www.victorianweb.org/art/illustration/tenniel/alice/1.4.jpg';
                outgoingResponse(data,'image');
                break;
            case 'deja vu':
                data.msg = 'Didn\'t you just ask me that?';
                outgoingResponse(data,'txt');
                break;
            case 'die':
                data.msg = '😭';
                outgoingResponse(data,'txt');
                break;
            case 'cool':
                data.msg = '😎';
                outgoingResponse(data,'txt');
                break;
            case 'skynet':
                data.msg = 'April 19, 2011';
                outgoingResponse(data,'txt');
                break;
            case '4 8 15 16 23 42':
                data.msg = 'http://static.wixstatic.com/media/43348a_277397739d6a21470b52bc854f7f1d81.gif';
                outgoingResponse(data,'image');
                break;
            case 'What is the air-speed velocity of an unladen swallow?':
                data.msg = 'http://style.org/unladenswallow/';
                outgoingResponse(data,'txt');
                break;

            case 'help':
                data.msg = 'type things like VVVVXBXVXVX and BBBXBXCBC to search';
                outgoingResponse(data,'txt');
                break;

            case '1':
                data.msg = 'this will recall history and select focus on N item';
                outgoingResponse(data,'txt');
                break;

            case '2':
                data.msg = 'this will recall history and select focus on N item';
                outgoingResponse(data,'txt');
                break;

            case '3':
                data.msg = 'this will recall history and select focus on N item';
                outgoingResponse(data,'txt');
                break;


            /// ADD VARIABLE QUERY, LIKE 'WHAT IS _______'

            //* * * * TEMP FOR TESTING * * * *//
            case 'similar':
                var res = {};
                res.bucket = 'search';
                res.channel = data.channelId;
                res.org = data.orgId;
                res.action = 'similar';
                res.searchSelect = [1];
                res.tokens = data.msg;
                incomingAction(res);
                break;
            case 'focus':
                var res = {};
                res.bucket = 'search';
                res.channel = data.channelId;
                res.org = data.orgId;
                res.action = 'focus';
                res.searchSelect = [1];
                res.tokens = data.msg;
                incomingAction(res);
                break;
            case 'modify':
                var res = {};
                res.bucket = 'search';
                res.channel = data.channelId;
                res.org = data.orgId;
                res.action = 'modify';
                res.searchSelect = [1];
                res.tokens = data.msg;
                incomingAction(res);
                break;
            case 'save':
                var res = {};
                res.bucket = 'purchase';
                res.channel = data.channelId;
                res.org = data.orgId;
                res.action = 'save';
                res.searchSelect = [1];
                res.tokens = data.msg;
                incomingAction(res);
                break;

            case 'checkout':
                var res = {};
                res.bucket = 'purchase';
                res.channel = data.channelId;
                res.org = data.orgId;
                res.action = 'checkout';
                //res.searchSelect = [1];
                res.tokens = data.msg;
                incomingAction(res);
                break;

            // case 'save':
            //     saveToCart(data);
            //     break;
            // case 'remove':
            //     removeFromCart(data);
            //     break;
            // case 'removeAll':
            //     removeAllCart(data);
            //     break;
            // case 'list':
            //     listCart(data);
            //     break;
            // case 'checkout':

            //* * * * * END TESTING * * * * *//

            default:
            //FUNCTION WITH CALLBACK TO PYTHON, CALLBACK PASSES DATA TO incomingAction():
            routeNLP(data.msg,data.channelId,data.orgId); //also send channel ID of slack user
        }

    })
});

//pushing incoming messages to python
function routeNLP(msg,channel,org){

    nlp.parse(msg, function(e, res) {
        if (e){console.log('NLP error ',e)}
        else {
            //TEMPORARY
            if(!res){
                res = {};
            }

            //TODO
            res.channel = channel;
            res.org = org;

            //TEMPORARY TODO
            // nlp doesn't handle these yet
            if (msg == 'similar'){
                res.action = 'similar';
                res.searchSelect = [1];
                res.tokens = msg;
            }
            else if (msg == 'modify'){
                res.action = 'modify';
                res.searchSelect = [1];
                res.tokens = msg;
            }
            else if (msg == 'focus'){
                res.action = 'focus';
                res.searchSelect = [1];
                res.tokens = msg;
            }

            incomingAction(res);
        }

    })
}

//sentence breakdown incoming from python
function incomingAction(data){

    console.log(data);

    //***** SAVE INCOMING STATE ******//
    //INCOMING DATA FROM SLACK (data obj in SLACK INCOMING MESSAGE)

    if (!data.org || !data.channel){
        console.log('missing channel or org Id 1');
    }
    var indexHist = data.org + "_" + data.channel;
    if (!messageHistory[indexHist]){ //new user, set up chat states
        messageHistory[indexHist] = {};
        messageHistory[indexHist].search = []; //random chats
        messageHistory[indexHist].banter = []; //search
        messageHistory[indexHist].purchase = []; //finalizing search and purchase
        messageHistory[indexHist].persona = []; //learn about our user
        messageHistory[indexHist].cart = []; //user shopping cart
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
        item.originalQuery = data; //store original query obj for other stuff

        //mock parsed sentence data from python
        var dataModify = 'price'; //color,price, etc
        var dataParam = 'less than';
        var dataVal = '30'; //blue,extra large, less, etc

        var cSearch = ''; //construct new search string

        //CONSTRUCT QUERY FROM AMAZON OBJECT
        if (item && item.amazon){
            //lol
            if(!dataModify){var dataModify};
            if(!dataParam){var dataParam};
            if(!dataVal){var dataVal};

            //handle special modifiers that need care, consideration, hard tweaks of amazon search API
            switch (dataModify) {
                case 'price':
                    searchInitial(item,{ // passing special FLAG for search to handle
                        'modify':dataModify,
                        'param':dataParam,
                        'val':dataVal
                    });
                    break;

                case 'brand':
                    searchInitial(item,{ // passing special FLAG for search to handle
                        'modify':dataModify,
                        'val':dataVal
                    });
                    break;

                default:
                    constructAmazonQuery(); //nm just construct a new query
            }


            function constructAmazonQuery(){
                async.eachSeries(data.searchSelect, function(searchSelect, callback) {

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
            switch (dataModify) {
                // CASES: color, size, price, genericDetail
                case 'color':

                    cSearch = dataVal + ' ' + cSearch; //add new color
                    data.tokens = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                case 'size':

                    cSearch = dataVal + ' ' + cSearch; //add new color
                    data.tokens = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                //texture, fabric, coating, etc
                case 'material':

                    cSearch = dataVal + ' ' + cSearch; //add new color
                    data.tokens = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                    break;

                //unsortable modifier
                case 'genericDetail':

                    cSearch = dataVal + ' ' + cSearch; //add new color
                    data.tokens = cSearch; //replace search string in data obj
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

        var indexHist = data.org + "_" + data.channel; //chat id

        //async push items to cart
        async.eachSeries(data.searchSelect, function(searchSelect, callback) {
            messageHistory[indexHist].cart.push(item.amazon[searchSelect - 1]); //add selected items to cart
            callback();
        }, function done(){
            //only support "add to cart" message for one item.
            //static:
            var sT = data.searchSelect[0];
            data.msg = item.amazon[sT - 1].ItemAttributes[0].Title + ' added to your cart. Type <i>remove item</i> to undo.';
            outgoingResponse(data,'txt');
        });
    });
}

//Build Amazon Cart
function outputCart(data) {
    var indexHist = data.org + "_" + data.channel; //chat id

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
            var propASIN = 'Item*'+i+'*ASIN';
            options[propASIN] = items[i].ASIN;
            var propQuan = 'Item*'+i+'*Quantity';
            options[propQuan] = items[i].Quantity;
        }
        console.log(options);

        client.createCart(options).then(function(results) {
            console.log('Results: ', results);
            var cartUrl = results.PurchaseURL;
            outgoingResponse(cartUrl,'txt');
        }).catch(function(err) {
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
            amazonParams.Keywords = data.tokens;
            amazonParams.responseGroup = 'ItemAttributes,Offers,Images';

            //check for flag
            if (flag && flag.modify){

               console.log('search flag ',flag);

                //parse flags
                if (flag.modify == 'price'){

                    switch (flag.param) {
                        case 'less':

                            //there's a price for the item
                            if (data.amazon[0].ItemAttributes[0].ListPrice[0].Amount[0]){

                                var newPrice = 0;

                                //check for original user query
                                if (data.originalQuery){
                                    //summoning original query obj. loop searchSelect [ ]
                                    async.eachSeries(data.originalQuery.searchSelect, function(searchSelect, callback) {
                                        //adding up prices for each item
                                        newPrice = newPrice + data.amazon[searchSelect - 1].ItemAttributes[0].ListPrice[0].Amount[0];
                                        callback();
                                    }, function done(){
                                        // calculate average price and decrease by 25%
                                        newPrice = newPrice / data.originalQuery.searchSelect.length; //average the price
                                        var per = newPrice * .25; //get 25% of price
                                        newPrice = newPrice - per; // subtract percentage
                                        newPrice = Math.round(newPrice); //clean price
                                        if (newPrice > 1){
                                            newPrice = Math.floor(newPrice / 1e11); //remove ¢, keep $
                                        }
                                        if (newPrice > 0){
                                            //add price param
                                            amazonParams.MaximumPrice = newPrice;
                                        }
                                        else {
                                            console.log('Error: not allowing search for max price below 0');
                                        }
                                    });
                                }
                                else {
                                    console.log("Error: original user query missing. it was not passed to amazon search correctly");
                                }
                            }
                            else {
                                console.log('error: amazon price missing');
                            }

                            break;

                        case 'less than':
                            console.log('less than');

                            //check if val is real number
                            if (flag.val && isNumber(flag.val)){

                                //WARNING: THIS SUCKS AND IS INACCURATE / TOO SPECIFIC OF A QUERY RIGHT NOW. USE WEAK SEARCHER

                                //user wanted one item at different price
                                if (data.originalQuery && data.originalQuery.searchSelect.length == 1){

                                    var searchSelect = data.originalQuery.searchSelect[0];

                                    if (data.amazon[searchSelect - 1].ItemAttributes[0].Title){
                                        amazonParams.Keywords = data.amazon[searchSelect - 1].ItemAttributes[0].Title;
                                        amazonParams.MaximumPrice = flag.val;
                                    }
                                    else {
                                        console.log('Error: Title is missing from amazon itemattributes object');
                                    }

                                }
                                else {
                                    console.log('Warning: no single item selected for less than (not supporting multiple), so resorting to less than N original query from user')
                                    amazonParams.MaximumPrice = flag.val;
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
            }
            console.log('amazonParams ',amazonParams);
            //IDEAS:
            //MODIFY searchIndex if persona weight > x\
            //IDENTIFY BRAND NAME TO SEARCH BY BRAND?


            //AMAZON BASIC SEARCH
            client.itemSearch(amazonParams).then(function(results){
              //console.log('checking for amazon server error so we handle',results);

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

            //handle no data error
            if (!data){
                console.log('error no amazon item found for similar search');
                data = {
                    msg:'Sorry, I don\'t understand, please ask me again'
                }
                outgoingResponse(data,'txt');
            }
            else {
                if (data.amazon){ //we have a previously saved amazon session

                    if (!flag){ //no flag passed in
                        flag = 'Intersection'; //default
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
                        //console.log('checking for amazon server error so we handle',results);
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
            console.log('TESTING FOR ERROR ',url);
            io.sockets.emit("msgFromSever", {message: url});
        });
    }
    //single image msg to user
    else if (action == 'txt'){
        io.sockets.emit("msgFromSever", {message: data.msg});
    }
    //single image msg to user
    else if (action == 'image'){
        io.sockets.emit("msgFromSever", {message: data.msg});
    }
    //one default image msg to user
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


////////////// HISTORY ACTIONS ///////////////

//store chat message in history
function saveHistory(data,results,type){

    if (!data.org || !data.channel){
        console.log('missing channel or org Id 2');
    }
    var indexHist = data.org + "_" + data.channel;

    switch (data.bucket) {
        case 'search':
            messageHistory[indexHist].search.push({
                channel:data.channel,
                org:data.org,
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
                var histLength = messageHistory[indexHist].search.length - 1; //retrieve position of history item in arr
                messageHistory[indexHist].search[histLength].amazon = [];
                for (var i = 0; i < results.length; i++) { //adding amazon results to hist
                     messageHistory[indexHist].search[histLength].amazon.push(results[i]);
                }
            }
            break;
        case 'banter':
            messageHistory[indexHist].banter.push({
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
            messageHistory[indexHist].purchase.push({
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
    if (!data.org || !data.channel){
        console.log('missing channel or org Id 3');
    }
    var indexHist = data.org + "_" + data.channel;

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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
