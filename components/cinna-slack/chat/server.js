var http = require('http');
var fs = require('fs');
var amazon = require('amazon-product-api'); //npm amazon-product-api
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

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    console.log("socket connected");

    socket.on("msgToClient", function(data) {
        //data.msg <<<--- incoming message
        // var msg;
        // if (data.msg == 'pic'){
        //  msg = 'http://www.thinkgeek.com/images/products/zoom/f044_portal2_aperture_test_subject_hat.jpg';
        // }
        // else if (data.msg == 'url'){
        //  msg = 'https://kipsearch.com';
        // }
        // else {
        //  msg = 'you sent '+data.msg;
        // }
        routeNLP(data.msg);
        
    })
});


function routeNLP(msg){ //pushing incoming messages to python
    //http request, wait for response, push to incomingAction()

    var sampleResponse = {
        action: 'initialQuery',
        tokens: msg
    };

    incomingAction(sampleResponse);
}

function incomingAction(data){ //sentence breakdown incoming from python


    //sort selection
    switch (data.action) {
        case 'initialQuery':  
            searchAmazon(data);
            break;        
        default:
            console.log('default');
    }


    //EXPECTING FROM PYTHON:
    // {
    //     //bucket: class, //search, banter, ordering <-- not needed probably
    //     nodePosition: [...], 
    //     sentenceTree: [...],
    //     tokens: []
    // }

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


    //* * * * * * * * *
    //BUCKET 2: Banter
    //* * * * * * * * *
    //how shall i respond?


    //* * * * * * * * *
    //BUCKET 3: Ordering
    //* * * * * * * * *
    //what order state are we in?
    // save 1 ---> store item in cart ---> RETURN "SAVED FOR LATER"
    // save all ---> 
    // view cart ---> get all items in cart ---> RETURN CART? or return URL TO amazon?
    // would you like me to get it for you? [kip question flag, wait for response] (PHASE 2)

}

function outgoingResponse(res){ //what we're replying to user with

    io.sockets.emit("msgFromSever", {message: res[0].MediumImage[0].URL[0]});
}

function stitchResults(){
    //stitch(['http://url1.png', ...], function(e, stitched_url){})
}

function searchAmazon(data){

    //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
    //browsenode
    //keywords
    //maximum price
    //minimum price
    //related item page
    //searchIndex (CATEGORY)

    client.itemSearch({  
      // searchIndex: 'DVD',
      Keywords: data.tokens,
      responseGroup: 'ItemAttributes,Offers,Images'
    }).then(function(results){

      outgoingResponse(results);
    }).catch(function(err){

      console.log('amazon err ',err[0].Error[0]);
    });

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