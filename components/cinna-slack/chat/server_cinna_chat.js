var http = require('http');
var fs = require('fs');
var Bot = require('slackbots');
var request = require('request');
var async = require('async');
var amazon = require('./amazon-product-api_modified'); //npm amazon-product-api
stitch = require('../image_processing/api.js')
var nlp = require('../nlp/api');
var cheerio = require('cheerio');

//load kip modules
var banter = require("./components/banter.js");
var purchase = require("./components/purchase.js");

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
                    'org':data.team,
                    'indexHist':data.team + "_" + data.channel //for retrieving chat history in node memory             
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
            'org':'kip',
            'indexHist':'kip' + "_" + socket.id //for retrieving chat history in node memory
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
    if (!messageHistory[data.source.indexHist]){ //new user, set up chat states
        messageHistory[data.source.indexHist] = {};
        messageHistory[data.source.indexHist].search = []; //random chats
        messageHistory[data.source.indexHist].banter = []; //search
        messageHistory[data.source.indexHist].purchase = []; //finalizing search and purchase
        messageHistory[data.source.indexHist].persona = []; //learn about our user
        messageHistory[data.source.indexHist].cart = []; //user shopping cart
        messageHistory[data.source.indexHist].allBuckets = []; //all buckets, chronological chat history
    }

    //check for canned responses/actions before routing to NLP
    banter.checkForCanned(data.msg,function(res,flag,query){

        //found canned response
        if(flag){
            switch(flag){
                case 'basic': //just respond, no actions
                    //send message
                    data.client_res = res;
                    cannedBanter(data,res);      
                    break;
                case 'search.initial':
                    //send message
                    data.client_res = res;
                    cannedBanter(data,res);  

                    //now search for item
                    data.tokens = [];
                    data.tokens.push(query); //search for this item
                    data.bucket = 'search';
                    data.action = 'initial';
                    incomingAction(data);  
                    break;
                case 'search.focus':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'search';
                    data.action = 'focus';
                    incomingAction(data); 
                    break;
                default:
                    console.log('error: canned action flag missing');
            }
        }
        //proceed to NLP instead
        else {
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
            if (res.dataModify){    
                data.dataModify = res.dataModify;
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
            //passing in data obj
            //pass messageHistory obj
            purchase.outputCart(data,messageHistory[data.source.indexHist],function(res){
                outgoingResponse(res,'txt');
            });
            break;
        default:
            console.log('error: no purchase bucket action selected');
    }

}


//* * * * * SEARCH ACTIONS * * * * * * * * //


function searchInitial(data,flag){

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
    // if (data.msg){
    //     data.tokens = [];
    //     data.tokens.push(data.msg);
    // }

    // //temp!
    // if (!data.searchSelect){
    //     data.searchSelect = [1];
    // }

    // //temp!
    // switch (true){
    //     case data.tokens[0].indexOf("in blue") !=-1 :

    //         data.dataModify = {
    //             type: 'color',
    //             val: ['blue']
    //         }     
    //         break;

    //     case data.tokens[0].indexOf("in XL") !=-1 :

    //         data.dataModify = {
    //             type: 'size',
    //             val: ['extra large','XL']
    //         } 
    //         break;   

    //     case data.tokens[0].indexOf("with collar") !=-1 :

    //         data.dataModify = {
    //             type: 'genericDetail',
    //             val: ['collar']
    //         }  
    //         break;  

    //     case data.tokens[0].indexOf("in wool") !=-1 :

    //         data.dataModify = {
    //             type: 'material',
    //             val: ['wool','cashmere','merino']
    //         }   
    //         break; 

    //     case data.tokens[0].indexOf("by Zara") !=-1 :

    //         data.dataModify = {
    //             type: 'brand',
    //             val: ['Zara']
    //         }   
    //         break;

    //     case data.tokens[0].indexOf("less than") !=-1 :

    //         data.dataModify = {
    //             type: 'price',
    //             param: 'less than',
    //             val: [25]
    //         } 
    //         break;   

    //     case data.tokens[0].indexOf("cheaper") !=-1 :

    //         data.dataModify = {
    //             type: 'price',
    //             param: 'less'
    //         }  
    //         break;
    // }


    //console.log('modified ',data);

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

    recallHistory(data, function(item){ 
        data.recallHistory = item; //added recalled history obj to data obj

        if (data.searchSelect && data.searchSelect.length == 1){
            if(data.recallHistory && data.recallHistory.amazon){

                var searchSelect = data.searchSelect[0] - 1;

                if (data.recallHistory.amazon[searchSelect]){

                    var attribs = data.recallHistory.amazon[searchSelect].ItemAttributes[0];
                    var cString = ''; //construct text reply

                    //check for large image to send back
                    if (data.recallHistory.amazon[searchSelect].LargeImage && data.recallHistory.amazon[searchSelect].LargeImage[0].URL[0]){
                        data.client_res = data.recallHistory.amazon[searchSelect].LargeImage[0].URL[0];
                        outgoingResponse(data,'final');
                    }

                    //send product title + price
                    data.client_res = attribs.Title[0]; 
                    //add price to this line, if found
                    if (attribs.ListPrice){
                        data.client_res =  addDecimal(attribs.ListPrice[0].Amount[0]) + " – " + data.client_res;
                    }
                    outgoingResponse(data,'final'); 
                    // //stall output for slack timing issue
                    // setTimeout(function(){ 
                    //     outgoingResponse(data,'final'); 
                    // }, 700);
                    

                    ///// product details string //////

                    //get size
                    if (attribs.Size){
                        cString = cString + ' ○ ' + "Size: " +  attribs.Size[0];
                    }

                    //get artist
                    if (attribs.Artist){
                        cString = cString + ' ○ ' + "Artist: " +  attribs.Artist[0];
                    }

                    //get brand or manfacturer
                    if (attribs.Brand){
                        cString = cString + ' ○ ' +  attribs.Brand[0];
                    }
                    else if (attribs.Manufacturer){
                        cString = cString + ' ○ ' +  attribs.Manufacturer[0];
                    }   

                    //get all stuff in details box
                    if (attribs.Feature){   
                        cString = cString + ' ○ ' + attribs.Feature.join(' ░ ');
                    }

                    //done collecting details string, now send
                    if (cString){
                        data.client_res = cString;
                        outgoingResponse(data,'final');
                    }

                    ///// end product details string /////

                    if (data.recallHistory.amazon[searchSelect].reviews){
                        data.client_res = '⭐️ ' +  data.recallHistory.amazon[searchSelect].reviews.rating + ' – ' + data.recallHistory.amazon[searchSelect].reviews.reviewCount + ' reviews'; 
                        outgoingResponse(data,'final');
                    }   
                    
                    getNumEmoji(data,searchSelect+1,function(res){
                        data.client_res = res + ' ' + data.recallHistory.urlShorten[searchSelect]; 
                        outgoingResponse(data,'final');
                    })

                }
                else {
                    console.log('warning: item selection does not exist in amazon array');
                }

            }
            else {
                console.log('error: amazon search missing from recallHistory obj');
            }
        }
        else {
            console.log('error: you can only select one item for search focus')
        }

    });

}

function searchMore(data){

    recallHistory(data, function(res){

        data = res; //bad

        if (data.amazon.length > 3){ //only trim down in thirds for now
            data.amazon.splice(0, 3);
        }

        var loopLame = [0,1,2];//lol
        async.eachSeries(loopLame, function(i, callback) {
            if (data.amazon[i]){
                //get reviews in circumvention manner (amazon not allowing anymore officially)
                request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+data.amazon[i].ASIN[0]+'', function(err, res, body) {
                  if(err){
                    console.log(err);
                    callback();
                  }
                  else {

                    $ = cheerio.load(body);

                    //get rating
                    var rating = ( $('.a-size-base').text()
                      .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                      .map(function (v) {return +v;}).shift();

                    //get reviewCount
                    var reviewCount = ( $('.a-link-emphasis').text()
                      .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                      .map(function (v) {return +v;}).shift();

                    //adding scraped reviews to amazon objects
                    data.amazon[i].reviews = {
                        rating: rating,
                        reviewCount: reviewCount
                    }
                    callback();
                  }
                });                
            }
            else {
                callback();
            }

        }, function done(){
            outgoingResponse(data,'stitch','amazon'); //send back msg to user
        });


        // //async push items to cart
        // async.eachSeries(data.searchSelect, function(searchSelect, callback) {
        //     messageHistory[data.source.indexHist].cart.push(item.amazon[searchSelect - 1]); //add selected items to cart
        //     callback();
        // }, function done(){
        //     //only support "add to cart" message for one item.
        //     //static:
        //     var sT = data.searchSelect[0];
        //     data.client_res = item.amazon[sT - 1].ItemAttributes[0].Title + ' added to your cart. Type <i>remove item</i> to undo.';
        //     outgoingResponse(data,'txt');
        // });
    });

    //go to end of search results array (3 at a time). if hit end of search array V
    //use amazon search itemPage to advance to more results
}

function searchBack(data){
    //SKIP BACK to history items (use recallHistory w. # of steps == 2)
}

//* * * * * BANTER ACTIONS * * * * * * * * //




//* * * * * * ORDER ACTIONS * * * * * * * * //


//save amazon item to cart
function saveToCart(data){

    data.bucket = 'search'; //modifying bucket to recall search history. a hack for now

    recallHistory(data, function(item){

        data.bucket = 'purchase'; //modifying bucket. a hack for now

        //async push items to cart
        async.eachSeries(data.searchSelect, function(searchSelect, callback) {
            messageHistory[data.source.indexHist].cart.push(item.amazon[searchSelect - 1]); //add selected items to cart
            callback();
        }, function done(){
            //only support "add to cart" message for one item.
            //static:
            var sT = data.searchSelect[0];
            // data.client_res = item.amazon[sT - 1].ItemAttributes[0].Title + ' added to your cart. Type <i>remove item</i> to undo.';
            
            // outgoingResponse(data,'txt');
            purchase.outputCart(data,messageHistory[data.source.indexHist],function(res){
                outgoingResponse(res,'txt');
            });
        });
    });
}

function viewCart(data){

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

               //console.log('search flag ',flag);

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

                var loopLame = [0,1,2];//lol
                async.eachSeries(loopLame, function(i, callback) {

                    if (data.amazon[i]){
                        //get reviews in circumvention manner (amazon not allowing anymore officially)
                        request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+data.amazon[i].ASIN[0]+'', function(err, res, body) {
                          if(err){
                            console.log(err);
                            callback();
                          }
                          else {

                            $ = cheerio.load(body);

                            //get rating
                            var rating = ( $('.a-size-base').text()
                              .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                              .map(function (v) {return +v;}).shift();

                            //get reviewCount
                            var reviewCount = ( $('.a-link-emphasis').text()
                              .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                              .map(function (v) {return +v;}).shift();

                            //adding scraped reviews to amazon objects
                            data.amazon[i].reviews = {
                                rating: rating,
                                reviewCount: reviewCount
                            }
                            callback();
                          }
                        });                        
                    }
                    else {
                        callback();
                    }


                }, function done(){
                    outgoingResponse(data,'stitch','amazon'); //send back msg to user
                });

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
                      // Keywords: data.recallHistory.tokens,
                      SimilarityType: flag, //other option is "Random" <<< test which is better results
                      responseGroup: 'ItemAttributes,Offers,Images'

                    }).then(function(results){

                        //console.log('RESULTS SIMILAR ',results);

                        data.amazon = results;

                        var loopLame = [0,1,2];//lol
                        async.eachSeries(loopLame, function(i, callback) {

                            //get reviews in circumvention manner (amazon not allowing anymore officially)
                            request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+data.amazon[i].ASIN[0]+'', function(err, res, body) {
                              if(err){
                                console.log(err);
                                callback();
                              }
                              else {

                                $ = cheerio.load(body);

                                //get rating
                                var rating = ( $('.a-size-base').text()
                                  .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                                  .map(function (v) {return +v;}).shift();

                                //get reviewCount
                                var reviewCount = ( $('.a-link-emphasis').text()
                                  .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
                                  .map(function (v) {return +v;}).shift();

                                //adding scraped reviews to amazon objects
                                data.amazon[i].reviews = {
                                    rating: rating,
                                    reviewCount: reviewCount
                                }
                                callback();
                              }
                            });

                        }, function done(){
                            data.action = 'initial';
                            outgoingResponse(data,'stitch','amazon'); //send back msg to user
                        });

                    }).catch(function(err){
                        console.log('amazon err ',err[0].Error[0]);
                        console.log('SIMILAR FAILED: should we fire random query or mod query');

                        var cSearch = '';
                        var itemAttrib = data.recallHistory.amazon[data.searchSelect - 1].ItemAttributes; //get selected item attributes

                        if (itemAttrib[0].Brand){
                            cSearch = cSearch + ' ' + itemAttrib[0].Brand[0];
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

                        console.log('BS string ugh ',cSearch);

                        data = data.recallHistory; //HACK!!!!!!
                        data.tokens = [];
                        data.tokens.push(cSearch);
                        searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search instead
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
    //stitch images before send to user
    if (action == 'stitch'){
        stitchResults(data,source,function(url){

            //sending out stitched image response
            data.client_res = url;
            sendResponse(data);    

            //send extra item URLs with image responses
            if (data.action == 'initial' || data.action == 'similar'){
                urlShorten(data,function(res){       
                    var count = 0;
                    async.eachSeries(res, function(i, callback) {
                        getNumEmoji(data,count+1,function(emoji){
                            data.client_res = emoji + ' ' + res[count];
                            sendResponse(data); 
                            count++;
                            callback();
                        });
                    }, function done(){
                        data.urlShorten = res;
                        saveHistory(data); //push new history state after we have stitched URL
                    });

                });
            }
            else {
                saveHistory(data); //push new history state after we have stitched URL
            }

            //* * * * * * * * * * *
            //which cinna response to include in message?
            //* * * * * * * * * * *
            banter.getCinnaResponse(data,function(res){
                if(res){
                    data.client_res = res;
                    sendResponse(data);
                }
            });

        });
    }
    //data.client_res > already added to data for response
    //text/image msg to user (not image results)
    else if (action == 'txt'){

        saveHistory(data);
        sendResponse(data);

        banter.getCinnaResponse(data,function(res){
            if(res){
                data.client_res = res;
                sendResponse(data);
            }
        });
    }
    //no cinna response check
    else if (action == 'final'){
        saveHistory(data);
        sendResponse(data);
    }
}

//send back msg to user, based on source.origin
function sendResponse(data){
    if (data.source.channel && data.source.origin == 'socket.io'){
        io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res});
    }
    else if (data.source.channel && data.source.origin == 'slack'){
        //eventually cinna can change emotions in this pic based on response type
        var params = {
            icon_url: 'http://kipthis.com/img/kip-icon.png'
        }
        bot.postMessage(data.source.channel, data.client_res, params);  
    }
    else {
        console.log('error: data.source.channel or source.origin missing')
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
                if (data.amazon[i]){

                    var price;

                    if (!data.amazon[i].ItemAttributes[0].ListPrice){
                        price = ''; //price missing, show blank
                    }
                    else{
                        if (data.amazon[i].ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                            price = '';
                        }
                        else {
                            // add price
                            price = data.amazon[i].ItemAttributes[0].ListPrice[0].Amount[0];
                            //convert to $0.00
                            price = addDecimal(price);                            
                        }
                    }

                    var primeAvail = 0;
                    if (data.amazon[i].Offers && data.amazon[i].Offers[0].Offer && data.amazon[i].Offers[0].Offer[0].OfferListing && data.amazon[i].Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime){
                        primeAvail = data.amazon[i].Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime[0];
                    }

                    var imageURL;
                    if (data.amazon[i].MediumImage && data.amazon[i].MediumImage[0].URL[0]){
                        imageURL = data.amazon[i].MediumImage[0].URL[0];
                    }
                    else {
                        imageURL = 'https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg'; //TEMP!!!!
                    }
  
                    toStitch.push({
                        url: imageURL,
                        price: price,
                        prime: primeAvail, //is prime available?
                        name: truncate(data.amazon[i].ItemAttributes[0].Title[0]), //TRIM NAME HERE 
                        reviews: data.amazon[i].reviews
                    });
                }
                else {
                    console.log('IMAGE MISSING!',data.amazon[i]);
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
        
    data.ts = new Date(); //adding timestamp
    
    if (!messageHistory[data.source.indexHist]){
        console.log('error: user doesnt exist in memory storage');
    }
    else {
        switch (data.bucket) {
            case 'search':
                messageHistory[data.source.indexHist].search.push(data);
                break;
            case 'banter':
                messageHistory[data.source.indexHist].banter.push(data);
                break;
            case 'purchase':
                messageHistory[data.source.indexHist].purchase.push(data);
            default:
        }
        messageHistory[data.source.indexHist].allBuckets.push(data);
        //console.log('😂 ',messageHistory[data.source.indexHist].allBuckets);
    }

}

//get user history
function recallHistory(data,callback,steps){
    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 3');
    }

    //if # of steps to recall
    if (!steps){
        var steps = 1;
    }
    //get by bucket type
    switch (data.bucket) {
        case 'search':
            //console.log(data);

            switch(data.action){
                //if action is focus, find lastest 'initial' item
                case 'focus':
                    var result = messageHistory[data.source.indexHist].search.filter(function( obj ) {
                      return obj.action == 'initial';
                    });
                    var arrLength = result.length - steps;
                    callback(result[arrLength]);
                    break;

                default:
                    var arrLength = messageHistory[data.source.indexHist].search.length - steps; //# of steps to reverse. default is 1
                    callback(messageHistory[data.source.indexHist].search[arrLength]); //get last item in arr
                    break;
            }

            break;
        case 'banter':
            var arrLength = messageHistory[data.source.indexHist].banter.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.source.indexHist].banter[arrLength]); //get last item in arr
            break;
        case 'purchase':
            var arrLength = messageHistory[data.source.indexHist].purchase.length - steps; //# of steps to reverse. default is 1
            callback(messageHistory[data.source.indexHist].purchase[arrLength]); //get last item in arr
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
   if (string.length > 80)
      return string.substring(0,80)+'...';
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

//pass in data.amazon , get shorten urls for first 3 things
function urlShorten(data,callback2){

    var loopLame = [0,1,2];//lol
    var urlArr = [];
    async.eachSeries(loopLame, function(i, callback) {      
        if (data.amazon[i]){
            request.get('https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl='+encodeURI(data.amazon[i].DetailPageURL[0])+'&format=txt', function(err, res, body) {
              if(err){
                console.log(err);
                callback();
              }
              else {
                urlArr.push(body);
                callback();
              }
            });            
        } 
        else{
            callback();
        }

    }, function done(){
        callback2(urlArr);
    });        
}

function getNumEmoji(data,number,callback){
    var numEmoji;
    switch(number){
        case 1: //emoji #1
            if (data.source.origin == 'socket.io'){
                numEmoji = '<span style="font-size:26px;">➊</span>';
            }
            else if (data.source.origin == 'slack'){
                numEmoji = ':one:';
            }
            break;
        case 2: //emoji #2
            if (data.source.origin == 'socket.io'){
                numEmoji = '<span style="font-size:26px;">➋</span>';
            }
            else if (data.source.origin == 'slack'){
                numEmoji = ':two:';
            }
            break;
        case 3: //emoji #3
            if (data.source.origin == 'socket.io'){
                numEmoji = '<span style="font-size:26px;">➌</span>';
            }
            else if (data.source.origin == 'slack'){
                numEmoji = ':three:';
            }
            break;
    }
    callback(numEmoji);
}





