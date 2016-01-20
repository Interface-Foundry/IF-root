var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var amazonHTML = require('./amazonHTML');

var history = require("./history.js");
var processData = require("./process.js");
var ioKip = require("./io.js");
var kip = require('kip')

var client = amazon.createClient({
  awsId: "AKIAILD2WZTCJPBMK66A",
  awsSecret: "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",
  awsTag: "bubboorev-20"
});


var searchInitial = function(data,flag){
    searchAmazon(data,'initial','none',flag);
}

var searchSimilar = function(data){
    if (data.dataModify){
        data.action = 'modify'; //because NLP changed randomly =_=;
        searchModify(data);
    }
    else if (data.recallHistory && data.recallHistory.amazon){
        searchAmazon(data,'similar','none','null');
    }
    else {
        console.log('warning: recallhistory obj missing');
        ioKip.sendTxtResponse(data,'Oops sorry, I\'m not sure which item you\'re referring to');
    }
}

var searchAmazon = function(data, type, query, flag) {

    //* * * * * * * * *  NN CLASSIFICATION NEEDED * * * * * * * * //
    // & & & & & & & & & & & & & & & & & & & & & & & & & & & & & &//
    // * * * * CLASSIFY incoming searches into categories --> search amazon with BrowseNode ---> better results

    //sort query type
    switch (type) {
        case 'initial':

            //add some amazon query params
            var amazonParams = {};
            amazonParams.responseGroup = 'ItemAttributes,Images,OfferFull';

            //remove random symbols
            removeSpecials(data.tokens[0],function(res){
                amazonParams.Keywords = res;
                continueProcess();
            });

            function continueProcess(){

                //check for flag to modify amazon search params
                if (flag && flag.type){ //search modifier

                    //parse flags
                    if (flag.type == 'price'){

                        //TEMPORARY
                        if (flag.param == 'less than'){
                            flag.param = 'less';
                        }

                        switch (flag.param) {
                            case 'less':

                                var searchSelect = data.searchSelect[0] - 1;

                                //there's a price for the item
                                if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[searchSelect].realPrice){

                                    var modPrice = data.recallHistory.amazon[searchSelect].realPrice;

                                    modPrice = modPrice.replace('$','');
                                    modPrice = modPrice.replace('.','');

                                    modPrice = parseInt(modPrice);

                                    var per = modPrice * .35; //get 35% of price
                                    modPrice = modPrice - per; // subtract percentage
                                    modPrice = Math.round(modPrice); //clean price

                                    if (modPrice > 0){

                                        //add price param
                                        amazonParams.MaximumPrice = modPrice.toString();

                                        //now resolving the search term param
                                        var itemAttrib = data.recallHistory.amazon[searchSelect].ItemAttributes[0];
                                        var cSearch = '';

                                        if (itemAttrib.Department){
                                            cSearch = cSearch + ' ' + itemAttrib.Department[0];
                                        }
                                        if (itemAttrib.ProductGroup){
                                            cSearch = cSearch + ' ' + itemAttrib.ProductGroup[0];
                                        }
                                        if (itemAttrib.Binding){
                                            cSearch = cSearch + ' ' + itemAttrib.Binding[0];
                                        }
                                        if (itemAttrib.Color){
                                            cSearch = cSearch + ' ' + itemAttrib.Color[0];
                                        }
                                        if (itemAttrib.ClothingSize){
                                            cSearch = cSearch + ' ' + itemAttrib.ClothingSize[0];
                                        }

                                        amazonParams.Keywords = cSearch;

                                        doSearch();
                                    }
                                    else {
                                        doSearch();
                                        console.log('Error: not allowing search for max price below 0');
                                    }

                                }
                                else {
                                    doSearch();
                                    console.log('error: amazon price missing');
                                }

                                break;

                            // case 'less than':
                            //     console.log('less than');

                            //     //check if val is real number
                            //     if (flag.val && isNumber(flag.val[0])){

                            //         console.log('FIRING less than ',data.searchSelect.length);

                            //         //WARNING: THIS SUCKS AND IS INACCURATE / TOO SPECIFIC OF A QUERY RIGHT NOW. USE WEAK SEARCHER

                            //         //user wanted one item at different price

                            //         if (data.searchSelect.length == 1){

                            //             var searchSelect = data.searchSelect[0];

                            //             if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title){
                            //                 amazonParams.Keywords = data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title;

                            //                 amazonParams.MaximumPrice = flag.val[0];
                            //                 amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                            //                 amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal


                            //                 console.log('params ',amazonParams);
                            //             }
                            //             else {
                            //                 console.log('Error: Title is missing from amazon itemattributes object');
                            //             }
                            //         }
                            //         else {
                            //             console.log('Warning: no single item selected for less than (not supporting multiple), so resorting to less than N original query from user')
                            //             amazonParams.MaximumPrice = flag.val[0];
                            //             amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                            //             amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal
                            //             amazonParams.Keywords = data.recallHistory.tokens[0];
                            //         }
                            //     }
                            //     else {
                            //         console.log(' number not used in flag.val with flag.modify == price');
                            //     }
                            //     break;
                            case 'more':
                                doSearch();

                                break;
                            case 'more than':
                                doSearch();
                                break;

                            default:
                                console.log('error: no flag.param found with flag.modify == price');
                                doSearch();
                        }
                    }
                    else if (flag.type == 'brand'){
                        console.log('BRAND FIRED');
                        doSearch();
                    }
                    else {
                        doSearch();
                    }
                }
                else {
                    doSearch();
                }

            }

            //console.log('amazonParams ',amazonParams);

            function doSearch(){
                //AMAZON BASIC SEARCH

                console.log('PARAMS ',amazonParams);

                client.itemSearch(amazonParams).then(function(results,err){
                    data.amazon = results;

                    //temporarily using parallel with only 3 item results, need to build array dynamically, using mapped closures /!\ /!\
                    if (results.length >= 3){

                        //get reviews and real prices
                        getAmazonStuff(data,results,function(res){
                            ioKip.outgoingResponse(res,'stitch','amazon');
                        });
                    }
                    //TEMP PATCH, FOR RESULTS UNDER 3 items
                    else {
                        var loopLame = [0,1,2];//lol
                        async.eachSeries(loopLame, function(i, callback) {
                            if (data.amazon[i]){
                                //get reviews by ASIN
                                getReviews(data.amazon[i].ASIN[0],function(rating,reviewCount){
                                    //adding scraped reviews to amazon objects
                                    data.amazon[i].reviews = {
                                        rating: rating,
                                        reviewCount: reviewCount
                                    }
                                    //GET PRICE
                                    getPrices(data.amazon[i],function(realPrice){
                                        data.amazon[i].realPrice = realPrice;
                                        callback();
                                    });
                                });
                            }
                            else {
                                callback();
                            }
                        }, function done(){
                            ioKip.outgoingResponse(data,'stitch','amazon');
                        });
                    }



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
                                //no results after weaksearch, now do:
                                ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have that available. Try another search?');
                        }
                    }
                });
            }

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

                if (data.recallHistory && data.recallHistory.amazon){ //we have a previously saved amazon session

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
                      responseGroup: 'ItemAttributes,Images,OfferFull'

                    }).then(function(results){

                        data.amazon = results;

                        //temporarily using parallel with only 3 item results, need to build array dynamically, using mapped closures /!\ /!\
                        if (results.length >= 3){

                            //get reviews and real prices
                            getAmazonStuff(data,results,function(res){
                                ioKip.outgoingResponse(res,'stitch','amazon');
                            });
                        }
                        //TEMP PATCH, FOR RESULTS UNDER 3 items
                        else {
                            var loopLame = [0,1,2];//lol
                            async.eachSeries(loopLame, function(i, callback) {
                                if (data.amazon[i]){
                                    //get reviews by ASIN
                                    getReviews(data.amazon[i].ASIN[0],function(rating,reviewCount){
                                        //adding scraped reviews to amazon objects
                                        data.amazon[i].reviews = {
                                            rating: rating,
                                            reviewCount: reviewCount
                                        }
                                        //GET PRICE
                                        getPrices(data.amazon[i],function(realPrice){
                                            data.amazon[i].realPrice = realPrice;
                                            callback();
                                        });
                                    });
                                }
                                else {
                                    callback();
                                }
                            }, function done(){
                                ioKip.outgoingResponse(data,'stitch','amazon');
                            });
                        }

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
                    console.log('warning: there was a data error resolving to basic search');
                    searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search instead
                }
            }
            break;

        case 'focus':
            break;
        default:
    }

};

//re-search but with less specific terms
function weakSearch(data,type,query,flag){
    //sort incoming flags for redundant searches
    switch (flag) {
        case 'weakSearch': //we already did weakSearch
            console.log('ALREADY TRIED weakSearch FLAG!');
            if (data.dataModify){
                if (data.dataModify.param){
                    var modDetail = data.dataModify.param;
                }else {
                    var modDetail = data.dataModify.val;
                }
                ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have that with' + modDetail + '. Would you like to do another search? Need help? Chat `help`.');
            }
            else {
                //no results after weaksearch, now do:
                ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have it available. Try another search?');
            }
            break;
        default:
            //no results, trying weak search
            console.log('no results');

            //select weakSearch action (initial, modify, etc)
            switch (data.action) {
                case 'modify':
                    if (data.dataModify && data.dataModify.type == 'price'){
                        console.log('cant find lower price item, preventing infinite loop');
                        ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have it available. Try another search?');
                    }
                    else {
                        searchModify(data, 'weakSearch');
                    }
                    break;
                default:
                    console.log('warning: weak search not enabled for '+ data.action);
                    ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have it available. Try another search?');
            }
    }
}


var searchModify = function(data,flag){
    //A child ASIN would be a blue shirt, size 16, sold by MyApparelStore
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/Variations_VariationDimensions.html

    var cSearch = ''; //construct new search string

    //CONSTRUCT QUERY FROM AMAZON OBJECT
    if (data.recallHistory && data.recallHistory.amazon){

        if (data.dataModify && data.dataModify.type){
            //handle special modifiers that need care, consideration, hard tweaks of amazon search API

            //ugh dead
            if (data.dataModify.val){
                var dumbVar = data.dataModify.val[0];
            }
            else {
                var dumbVar = '';
            }

            switch (data.dataModify.type) {
                case 'price':
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVar
                    });
                    break;

                case 'brand':
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'val':dumbVar
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
        data.action = 'initial';
        searchInitial(data); //do a search anyway
    }


    //after query construction, add modifier and fire search
    function addModifier(){

        cSearch = cSearch.toLowerCase();

        //SORT WHICH TRAITS TO MODIFY
        switch (data.dataModify.type) {
            // CASES: color, size, price, genericDetail
            case 'color':

                //remove colors from item name for new search with new color
                var CSS_COLOR_NAMES = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgrey","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
                async.eachSeries(CSS_COLOR_NAMES, function(i, callback) {
                    cSearch = cSearch.replace(i,'');
                    callback();
                }, function done(){
                    cSearch = data.dataModify.val[0].name + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                });

                break;

            case 'size':

                var SIZES = ["xxxs","xxs"," xs ","extra small"," s ","small"," m ","medium"," l ", "large"," xl ","extra large","xxl","xxxl","xxxxl","slimfit"," slim ","skinny", "petite", "plus size", "chubby", " big ", "curvy", " hourglass ", "rectangle-body", "triangle-body", "apple-shape", "pear-shape"];
                async.eachSeries(SIZES, function(i, callback) {
                    cSearch = cSearch.replace(i,'');
                    callback();
                }, function done(){
                    cSearch = data.dataModify.val[0] + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                });
                break;

            //texture, fabric, coating, etc
            case 'material':

                cSearch = data.dataModify.val[0] + ' ' + cSearch; //add new color
                data.tokens[0] = cSearch; //replace search string in data obj
                searchInitial(data,flag); //do a new search
                break;

            //unsortable modifier
            case 'genericDetail':
                //FIXING random glitch. GLITCH NLP should output this to "purchase" bucket, "save" action. temp fix
                if (data.dataModify.val == 'buy'){
                    data.bucket = 'purchase';
                    data.action = 'save';
                    saveToCart(data);
                }
                //normal action here
                else {
                    //SORT THROUGH RESULTS OF SIZES, FILTER
                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                }
                break;
        }
    }

}

var searchFocus = function(data){

    if (data.searchSelect && data.searchSelect.length == 1){ //we have something to focus on
        if(data.recallHistory && data.recallHistory.amazon){

            var searchSelect = data.searchSelect[0] - 1;

            if (data.recallHistory.amazon[searchSelect]){

                var attribs = data.recallHistory.amazon[searchSelect].ItemAttributes[0];
                var cString = ''; //construct text reply
                data.client_res = []; //building order of msg delivery to user

                // * * * * * Building response message array * * * * * //
                //check for large image to send back
                if (data.recallHistory.amazon[searchSelect].LargeImage && data.recallHistory.amazon[searchSelect].LargeImage[0].URL[0]){
                    data.client_res.push(data.recallHistory.amazon[searchSelect].LargeImage[0].URL[0]);
                }
                //push number emoji + item URL
                processData.getNumEmoji(data,searchSelect+1,function(res){
                    data.client_res.push(res + ' ' + data.recallHistory.urlShorten[searchSelect]);
                    dumbFunction(); //fire after get
                })

                //pointless ¯\_(ツ)_/¯ ... just makes sure the emoji number + product URL go first in msg order
                function dumbFunction(){
                    //send product title + price
                    var topStr = attribs.Title[0];

                    //if realprice exists, add it to title
                    if (data.recallHistory.amazon[searchSelect].realPrice){
                        topStr = data.recallHistory.amazon[searchSelect].realPrice + " – " + topStr;
                    }

                    //Make top line bold
                    if (data.source.origin == 'slack'){
                        topStr = '*'+topStr+'*';
                    }else if (data.source.origin == 'socket.io'){
                        topStr = '<b>'+topStr+'</b>';
                    }

                    data.client_res.push(topStr);

                    ///// build product details string //////

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
                        data.client_res.push(cString);
                        //outgoingResponse(data,'final');
                    }
                    ///// end product details string /////

                    //get review
                    if (data.recallHistory.amazon[searchSelect].reviews && data.recallHistory.amazon[searchSelect].reviews.rating){
                        data.client_res.push('⭐️ ' +  data.recallHistory.amazon[searchSelect].reviews.rating + ' – ' + data.recallHistory.amazon[searchSelect].reviews.reviewCount + ' reviews');
                    }

                    ioKip.outgoingResponse(data,'final');

                }

            }else {
                console.log('warning: item selection does not exist in amazon array');
                ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
            }
        }else {
            console.log('error: amazon search missing from recallHistory obj');
            ioKip.sendTxtResponse(data,'Oops sorry, I\'m not sure which item you\'re referring to');
        }
    }else {
        console.log('error: you can only select one item for search focus');
        ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
    }

}

var searchMore = function(data){

    if (data.recallHistory && data.recallHistory.amazon){
        //build new data obj so there's no mongo duplicate
        data = {};
        data.amazon = data.recallHistory.amazon;
        data.source = data.recallHistory.source;
        data.bucket = data.recallHistory.bucket;
        data.action = data.recallHistory.action;
        data.msg = data.recallHistory.msg;
        data.tokens = data.recallHistory.tokens;

        if (data.amazon.length > 3){ //only trim down in thirds for now
            data.amazon.splice(0, 3);
        }

        //temporarily using parallel with only 3 item results, need to build array dynamically, using mapped closures /!\ /!\
        if (data.amazon.length >= 3){
            getAmazonStuff(data,data.amazon,function(res){
                ioKip.outgoingResponse(res,'stitch','amazon');
            });
        }
        //TEMP PATCH, FOR RESULTS UNDER 3 items
        else {
            var loopLame = [0,1,2];//lol
            async.eachSeries(loopLame, function(i, callback) {
                if (data.amazon[i]){
                    //get reviews by ASIN
                    getReviews(data.amazon[i].ASIN[0],function(rating,reviewCount){
                        //adding scraped reviews to amazon objects
                        data.amazon[i].reviews = {
                            rating: rating,
                            reviewCount: reviewCount
                        }
                        //GET PRICE
                        getPrices(data.amazon[i],function(realPrice){
                            data.amazon[i].realPrice = realPrice;
                            callback();
                        });
                    });
                }
                else {
                    callback();
                }
            }, function done(){
                ioKip.outgoingResponse(data,'stitch','amazon');
            });
        }
    }else {
        console.log('warning: recallHistory missing in searchMore()');
        ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
    }

}

//* * * * tools for helping with search * * * * //

var getReviews = function(ASIN,callback) {
    //get reviews in circumvention manner (amazon not allowing anymore officially)
    request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+ASIN+'', function(err, res, body) {
      if(err){
        console.log('getReviews error: ',err);
        callback();
      }
      else {
        $ = cheerio.load(body);
        callback(( $('.a-size-base').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift(),( $('.a-link-emphasis').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift());
      }
    });
};

var getPrices = function(item,callback){

    var url = item.DetailPageURL[0];
    var price;  // get price from API
    if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice){
        //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
        console.log('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

        price = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

    }
    else if (item.ItemAttributes[0].ListPrice){

        console.log('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

        if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
            price = '';
        }
        else {
          // add price
          price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
        }
    }

    amazonHTML.basic(url, function(err, product) {
      kip.err(err); // print error

      if (product && product.price) {
        console.log('returning early with price: ' + product.price);
        return callback(product.price)
      }

      console.log('product.price: ' + product.price + ', price: ' + price);
      price = product.price || price || '';
      console.log('final price: ' + price);
      callback(price);
    })
}


var getAmazonStuff = function(data,results,callback3){

    //!\\ //!\\ NOTE!!! Add timeout here, fire callback if parallel doesnt fire callback!!

    async.parallel([
        //* * item 1 * * *//
        //get review
        function(callback){
            var id = results[0].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            //GET PRICE
            getPrices(results[0],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        },

        //* * item 2 * * *//
        //get review
        function(callback){
            var id = results[1].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            getPrices(results[1],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        },

        //* * item 3 * * *//
        //get review
        function(callback){
            var id = results[2].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            getPrices(results[2],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        }
    ],
    function(err, rez){
        if (err){
            console.log('Error: parallel getAmazonStuff in search.js ',err);
        }
        var count = 0;
        var loopLame = [0,0,1,1,2,2];
        async.eachSeries(loopLame, function(i, callback) {
            if (data.amazon[i]){

                //TEST SCRAPE RESULTS NULL BEORE PROCESS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                if (rez[count].rating){
                    console.log('add rating');
                    data.amazon[i].reviews = rez[count];
                }
                else if(rez[count].realPrice){
                    console.log('add real price');
                    data.amazon[i].realPrice = rez[count].realPrice;
                }
                else {
                    console.log('/!/ Warning: no reviews or real prices found for current item: ',data);
                }
                count++;
                callback();
            }
            else {
                callback();
            }
        }, function done(){
            callback3(data);
        });
    });
}

/////////// tools /////////////

function removeSpecials(str,callback) {
    var lower = str.toLowerCase();
    var upper = str.toUpperCase();

    var res = "";
    for(var i=0; i<lower.length; ++i) {
        if(lower[i] != upper[i] || lower[i].trim() === '')
            res += str[i];
    }
    callback(res);
}



/// exports
module.exports.searchInitial = searchInitial;
module.exports.searchSimilar = searchSimilar;
module.exports.getReviews = getReviews;
module.exports.getPrices = getPrices;
module.exports.getAmazonStuff = getAmazonStuff;
module.exports.searchAmazon = searchAmazon;
module.exports.searchModify = searchModify;
module.exports.searchFocus = searchFocus;
module.exports.searchMore = searchMore;
