var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var _ = require('lodash');

var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var amazonHTML = require('./amazonHTML');

var history = require("./history.js");
var processData = require("./process.js");
var ioKip = require("./io.js");
var kip = require('kip')

var debug = true || process.env.NODE_ENV=='production' ? function(){} : console.log.bind(console);


// var client = amazon.createClient({
//   awsId: "AKIAILD2WZTCJPBMK66A",
//   awsSecret: "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",
//   awsTag: "bubboorev-20"
// });

var client = amazon.createClient({
  awsId: "AKIAIKMXJTAV2ORZMWMQ",
  awsSecret: "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",
  awsTag: "quic0b-20"
});

var searchInitial = function(data,flag){
    searchAmazon(data,data.action,'none',flag);
}

var searchSimilar = function(data){
    if (data.dataModify && data.dataModify.val.length > 0){
        data.action = 'modify'; //because NLP changed randomly =_=;
        searchModify(data);
    }
    else if ((data.recallHistory && data.recallHistory.amazon) || (data.flags && data.flags.recalled)){
        searchAmazon(data,'similar','none','null');
    }
    else {
        debug('warning: recallhistory obj missing');
        ioKip.sendTxtResponse(data,'Oops sorry, I\'m not sure which item you\'re referring to');
    }
}

var searchAmazon = function(data, type, query, flag) {
    debug(data);
    debug('searching amazon');

    //* * * * * * * * *  NN CLASSIFICATION NEEDED * * * * * * * * //
    // & & & & & & & & & & & & & & & & & & & & & & & & & & & & & &//
    // * * * * CLASSIFY incoming searches into categories --> search amazon with BrowseNode ---> better results

    //sort query type
    switch (type) {
        case 'initial':
        case 'modify':

            //add some amazon query params
            var amazonParams = {};
            amazonParams.responseGroup = 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank';

            if (!data.tokens || data.tokens.length < 1) {
              data.tokens = [data.msg];
            }
            if (data.tokens && data.tokens.length > 0){
                //remove random symbols
                amazonParams.Keywords = data.tokens[0];
                continueProcess();

                // debug('X X X ',data.tokens[0]);
                // removeSpecials(data.tokens[0],function(res){
                //     debug('Y Y Y ',res)
                //     amazonParams.Keywords = data.tokens[0];
                //     continueProcess();
                // });
            }
            else {
                debug('Error: data.tokens missing from searchAmazon');
                ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
            }


            function continueProcess(){

                if (data.recallHistory && data.searchSelect){
                    var searchSelect = data.searchSelect[0] - 1;
                    if (data.recallHistory.amazon[searchSelect]){
                        var productGroup = data.recallHistory.amazon[searchSelect].ItemAttributes[0].ProductGroup[0];
                        var browseNodes = data.recallHistory.amazon[searchSelect].BrowseNodes[0].BrowseNode;
                    }
                    else { //fixing an NLP parse issue and routing to normal query
                        flag = '';
                        data.action = 'initial';
                        doSearch();
                    }
                }

                //check for flag to modify amazon search params
                if (flag && flag.type){ //search modifier

                    //parse flags

                    if (flag.type == 'color' || flag.type == 'size' || flag.type == 'material' || flag.type == 'genericDetail' && flag.val){

                        debug('FLAG TYPE &!&!&! ',flag.type);

                        if (flag.flagAction == 'weakSearchContinue' && data.amazonParams || flag.flagAction == 'weakSearch' && data.amazonParams){
                            if (data.amazonParams){
                                debug('GENERCICCC: DOING WEAK NODE SEARCH');
                                amazonParams = data.amazonParams;
                                doSearch();
                            }
                            else {
                                debug('Error: data.amazonParams not found while doing weaksearch in initial search');
                                ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
                            }
                        }
                        else {
                            parseAmazon(productGroup,browseNodes,function(res){
                                if(!res.BrowseNode){
                                    ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have that available. Try another search?');

                                }else {
                                    amazonParams.SearchIndex = res.SearchIndex;
                                    amazonParams.BrowseNode = res.BrowseNode;

                                    if (flag.val instanceof Array){
                                        debug('IS ARRAY');
                                        // if (flag.val[0].name == 'lime' || flag.val[0].name == 'Lime'){
                                        //     flag.val[0].name = 'green';
                                        // }
                                        amazonParams.Keywords = flag.val[0].name; //!\!\!\!\ remove so we query by browsenode
                                    }else {
                                        if (flag.val.name){
                                            // if (flag.val.name == 'lime' || flag.val.name == 'Lime'){
                                            //     flag.val.name = 'green';
                                            // }
                                            amazonParams.Keywords = flag.val.name; //!\!\!\!\ remove so we query by browsenode
                                        }else {
                                            amazonParams.Keywords = flag.val; //!\!\!\!\ remove so we query by browsenode
                                        }
                                    }
                                    debug('KEYWORDS ',amazonParams.Keywords);
                                    doSearch();
                                }

                            });
                        }

                    }

                    else if (flag.type == 'price'){

                        //TEMPORARY
                        if (flag.param == 'less than'){
                            flag.param = 'less';
                        }

                        switch (flag.param) {
                            case 'less':

                                if (flag.flagAction == 'weakSearchContinue' || flag.flagAction == 'weakSearch' && data.amazonParams){
                                    debug('? ?? ? ? ? ? ? ? ');
                                    if (data.amazonParams){
                                        debug('DOING WEAK NODE SEARCH');
                                        amazonParams = data.amazonParams;
                                        doSearch();
                                    }
                                    else {
                                        debug('Error: data.amazonParams not found while doing weaksearch in initial search');
                                        ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
                                    }
                                }
                                else {
                                    //there's a price for the item
                                    if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[searchSelect].realPrice){

                                        var modPrice = data.recallHistory.amazon[searchSelect].realPrice;

                                        //remove price range text
                                        if (modPrice.indexOf('-') > 0){
                                          //this is a price range, e.g. $29.95 - $42.95, just process lowest number
                                          modPrice = modPrice.substring(0, modPrice.indexOf('-'));
                                          modPrice = modPrice.trim();
                                        }

                                        debug('MODDED PROCE ',modPrice);

                                        modPrice = modPrice.replace('$','');
                                        modPrice = modPrice.replace('.','');

                                        modPrice = parseInt(modPrice);

                                        var per = modPrice * .35; //get 35% of price
                                        modPrice = modPrice - per; // subtract percentage
                                        modPrice = Math.round(modPrice); //clean price

                                        if (modPrice < 0){
                                            modPrice = 25;
                                        }

                                        //its a real number, shoudl always be a real number here,
                                        if (modPrice > 0){

                                            debug('browsenode?1 ',JSON.stringify(data.recallHistory.amazon[searchSelect].BrowseNodes));

                                            //WHAT DO IF NO PG? NORMAL SEARCH?
                                            if (data.recallHistory.amazon[searchSelect].ItemAttributes[0].ProductGroup){

                                                debug('!!productGroup <-- ',productGroup);

                                                parseAmazon(productGroup,browseNodes,function(res){

                                                    //* * * * * TEMPORARY TO HELP WITH CHEAPER RESULTS??????????? * * * * * //
                                                    res.BrowseNode = res.BrowseNode.split(',');
                                                    debug('arr ',res.BrowseNode);
                                                    debug('ARRAY LENGTH ',res.BrowseNode.length);
                                                    if (res.BrowseNode && res.BrowseNode.length >= 2){
                                                        res.BrowseNode = res.BrowseNode.slice(0,2);
                                                    }
                                                    debug('arr ',res.BrowseNode);
                                                    debug('ARRAY LENGTH ',res.BrowseNode.length);

                                                    res.BrowseNode = res.BrowseNode.toString();
                                                    //* * * * * * * * * * * END TEST * * * * * * * * * * * * * * * * * * //


                                                    amazonParams.SearchIndex = res.SearchIndex;
                                                    amazonParams.BrowseNode = res.BrowseNode;
                                                    amazonParams.MaximumPrice = modPrice.toString();
                                                    delete amazonParams.Keywords; //!\!\!\!\ remove so we query by browsenode
                                                    doSearch();
                                                });
                                            }
                                            else {
                                                debug('Error: Product Group missing from amazon itemAttributes');
                                                doSearch();
                                            }


                                        }
                                        else {
                                            doSearch();
                                            debug('Error: not allowing search for max price below 0');
                                        }

                                    }
                                    else {
                                        doSearch();
                                        debug('error: amazon price missing');
                                    }
                                }
                                break;


                                //http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SortingbyPopularityPriceorCondition.html
                                /// sort by reviews / cheaper

                            // case 'less than':
                            //     debug('less than');

                            //     //check if val is real number
                            //     if (flag.val && isNumber(flag.val[0])){

                            //         debug('FIRING less than ',data.searchSelect.length);

                            //         //WARNING: THIS SUCKS AND IS INACCURATE / TOO SPECIFIC OF A QUERY RIGHT NOW. USE WEAK SEARCHER

                            //         //user wanted one item at different price

                            //         if (data.searchSelect.length == 1){

                            //             var searchSelect = data.searchSelect[0];

                            //             if (data.recallHistory && data.recallHistory.amazon && data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title){
                            //                 amazonParams.Keywords = data.recallHistory.amazon[searchSelect - 1].ItemAttributes[0].Title;

                            //                 amazonParams.MaximumPrice = flag.val[0];
                            //                 amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                            //                 amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal


                            //                 debug('params ',amazonParams);
                            //             }
                            //             else {
                            //                 debug('Error: Title is missing from amazon itemattributes object');
                            //             }
                            //         }
                            //         else {
                            //             debug('Warning: no single item selected for less than (not supporting multiple), so resorting to less than N original query from user')
                            //             amazonParams.MaximumPrice = flag.val[0];
                            //             amazonParams.MaximumPrice = parseInt(amazonParams.MaximumPrice); //remove any decimals
                            //             amazonParams.MaximumPrice = amazonParams.MaximumPrice.toString() + '00'; //add amazon friendly decimal
                            //             amazonParams.Keywords = data.recallHistory.tokens[0];
                            //         }
                            //     }
                            //     else {
                            //         debug(' number not used in flag.val with flag.modify == price');
                            //     }
                            //     break;
                            case 'more':
                                doSearch();
                                break;
                            case 'more than':
                                doSearch();
                                break;
                            default:
                                debug('error: no flag.param found with flag.modify == price');
                                doSearch();
                        }
                    }
                    else if (flag.type == 'brand'){
                        debug('BRAND FIRED');
                        doSearch();
                    }
                    //this fires if we didn't get enough results from normal initial query
                    else if (flag.type == 'initial' && flag.flagAction == 'weakSearchContinue' && data.amazonParams || flag.type == 'initial' && flag.flagAction == 'weakSearch' && data.amazonParams){
                        debug('intial search advanced query', data.amazonParams);
                        amazonParams = data.amazonParams;
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

            //debug('amazonParams ',amazonParams);

            function doSearch(){
                //AMAZON BASIC SEARCH

                debug('PARAMS ',amazonParams);
                if (!data.amazonParams){
                    data.amazonParams = amazonParams;
                }

                client.itemSearch(amazonParams).then(function(results,err){

                    debug('got search')
                    debug(results.length);
                    if (err) { debug(err); }

                    results.map(function(r) {
                      if ((_.get(r, 'Offers[0].TotalOffers[0]') || '0') === '0') {
                        r.mustSelectSize = true;
                      }
                    })

                    // results = results.filter(function(r) {
                    //   return (_.get(r, 'Offers[0].TotalOffers[0]') || '0') !== '0';
                    // })

                    data.amazon = results;

                    debug('found ' + data.amazon.length + ' available search results');

                    if (data.amazon[0]){
                        debug('#1 browsenode ',JSON.stringify(data.amazon[0].BrowseNodes));
                        debug('#1 productGroup <-- ',data.amazon[0].ItemAttributes[0].ProductGroup[0]);
                    }
                    if (data.amazon[1]){
                        debug('#2 browsenode ',JSON.stringify(data.amazon[1].BrowseNodes));
                        debug('#2 productGroup <-- ',data.amazon[1].ItemAttributes[0].ProductGroup[0]);
                    }
                    if (data.amazon[2]){
                        debug('#3 browsenode ',JSON.stringify(data.amazon[2].BrowseNodes));
                        debug('#3 productGroup <-- ',data.amazon[2].ItemAttributes[0].ProductGroup[0]);
                    }

                    //temporarily using async parallel with only 3 item results, need to build array dynamically, using mapped closures /!\ /!\
                    if (results.length >= 3){

                        //get reviews and real prices
                        getAmazonStuff(data,results,function(res){
                            ioKip.outgoingResponse(res,'stitch','amazon');
                        });
                    }
                    //TEMP PATCH, FOR RESULTS UNDER 3 items
                    else if (results.length >= 1){
                        // //do a weak search
                        // weakSearch(data,type,query,flag,amazonParams);

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
                    else {
                        //do a weak search
                        weakSearch(data,type,query,flag,amazonParams);
                    }

                }).catch(function(err){
                    console.error(err);

                    //handle err codes. do stuff.
                    if (err[0].Error[0].Code[0]){
                        switch (err[0].Error[0].Code[0]) {

                            //CASE: No results for search
                            case 'AWS.ECommerceService.NoExactMatches':
                                //do a weak search
                                weakSearch(data,type,query,flag,amazonParams);
                                break;

                            default:
                                debug('amazon err ',err[0].Error[0]);
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
                debug('error no amazon item found for similar search');

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
                        // debug('searchNum:', searchNum,'recallhistory.amazon:',data.recallHistory.amazon)
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
                      responseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank'

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
                                        getPrices(data.amazon[i],function(realPrice,altImage){
                                            data.amazon[i].realPrice = realPrice;
                                            if (altImage){
                                               data.amazon[i].altImage = altImage;
                                            }
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
                        debug('amazon err ',err[0].Error[0]);
                        debug('SIMILAR FAILED: should we fire random query or mod query');

                         //----supervisor: adding flag to variable since it is overwitten in the HACK code below ---//
                        // debug('Mitsu search.js493: ',data)
                        var flags = null
                        if (data.flags && data.flags.toCinna) {
                            flags = data.flags
                        }
                        //------------------------------------------------------------------------------------------//
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

                        debug('BS string ugh ',cSearch);

                        data = data.recallHistory; //HACK!!!!!!
                        //----supervisor: re-adding back flag from above var ---//
                        if (flags) {
                           data.flags = flags
                           debug('\n\n\n\n!!!Mitsu search520: ',data,'\n\n\n\n')
                        }
                        //------------------------------------------------------------------------------------------//
                        data.tokens = [];
                        data.tokens.push(cSearch);
                        searchAmazon(data,'initial'); //if amazon id doesn't exist, do init search instead
                        //searchAmazon(data, type, query, 'Random'); //if no results, retry search with random

                    });
                }
                else {
                    debug('warning: there was a data error resolving to basic search');
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
function weakSearch(data,type,query,flag,amazonParams){
    //sort incoming flags for redundant searches
    switch (flag) {
        case 'weakSearch': //we already did weakSearch
            debug('ALREADY TRIED weakSearch FLAG!');
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
            debug('no results');

            //select weakSearch action (initial, modify, etc)
            switch (data.action) {
                case 'modify':
                    if (data.dataModify && data.amazonParams){
                        //debug('cant find lower price item, preventing infinite loop');
                        debug('dataforModifyPRICE ',data.amazonParams);
                        data.amazonParams.BrowseNode = data.amazonParams.BrowseNode.split(',');
                        debug('newNodes ',data.amazonParams.BrowseNode);
                        data.amazonParams.BrowseNode.pop(); // remove last id in arr
                        //data.amazonParams.BrowseNode.shift(); // remove last id in arr
                        debug('newNodes POPPED ', data.amazonParams.BrowseNode);

                        debug('arr length ',data.amazonParams.BrowseNode.length);

                        setTimeout(function() {
                            if(data.amazonParams.BrowseNode.length > 1){
                                debug('continue trying to search!');
                                data.amazonParams.BrowseNode = data.amazonParams.BrowseNode.toString();
                                searchModify(data, 'weakSearchContinue');
                            }else if (data.amazonParams.BrowseNode.length == 1) { //ok last one, set flag
                                data.amazonParams.BrowseNode = data.amazonParams.BrowseNode.toString();
                                debug('ok our last search!!!!!!!!!!!!!!!!!!!');
                                searchModify(data, 'weakSearch');
                            }
                            else {
                                debug('warning: no results found after trying weak searches. consider re-searching for SOMETHING to give user');
                                ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have it available. Try another search?');
                            }
                        }, 250);

                    }
                    else {
                        searchModify(data, 'weakSearch');
                    }
                    break;
                case 'initial':
                    if (data.amazonParams && data.amazonParams.Keywords){

                        debug('PARAMS ',data.amazonParams);

                        var newQuery = data.amazonParams.Keywords.split(/[ ,]+/).filter(Boolean);
                        debug('split ',newQuery);
                        newQuery.pop();
                        debug('newQuery ',newQuery);
                        debug('newQuery length ',newQuery.length);

                        // if (newQuery.length > 1){
                        //     newQuery = newQuery.pop();
                        //     debug('newQuery ',newQuery);
                        // }
                        // else {
                        //     //last search
                        // }

                        setTimeout(function() {

                            if(newQuery.length > 1){
                                debug('continue trying to search!');
                                data.amazonParams.Keywords = newQuery.toString();
                                searchInitial(data, {type:'initial',flagAction:'weakSearchContinue'});

                            }else if (newQuery.length == 1) { //ok last one, set flag
                                debug('ok our last search!!!!!!!!!!!!!!!!!!!');
                                data.amazonParams.Keywords = newQuery.toString();
                                searchInitial(data, {type:'initial',flagAction:'weakSearchContinue'});
                            }
                            else {
                                debug('warning: no results found after trying weak INITIAL searches.');
                                ioKip.sendTxtResponse(data,'Sorry, it looks like we don\'t have it available. Try another search?');
                            }

                        }, 250);





                    }
                    else {
                        //searchModify(data, 'weakSearch');
                        debug('NO PARAMS FOUND ',data);
                    }
                    break;
                default:
                    debug('warning: weak search not enabled for '+ data.action);
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
                var dumbVal = data.dataModify.val[0];
            }
            else {
                var dumbVal = '';
            }

            switch (data.dataModify.type) {
                case 'price':
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVal,
                        'flagAction':flag
                    });
                    break;

                case 'color':
                    debug('COLOR FIRED!!!');
                    debug('COLOR type: ',data.dataModify.type);
                    debug('COLOR param: ',data.dataModify.param);
                    debug('COLOR val: ',dumbVal);
                    debug('COLOR val: name: ',dumbVal.name);
                    debug('COLOR flagAction: ',flag);
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVal,
                        'flagAction':flag
                    });
                    break;


                case 'size':

                    debug('SIZE FIRED!!!');
                    debug('SIZE type: ',data.dataModify.type);
                    debug('SIZE param: ',data.dataModify.param);
                    debug('SIZE val: ',dumbVal);
                    debug('SIZE val: name: ',dumbVal.name);
                    debug('SIZE flagAction: ',flag);
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVal,
                        'flagAction':flag
                    });
                    break;

                //texture, fabric, coating, etc
                case 'material':

                    debug('material FIRED!!!');
                    debug('material type: ',data.dataModify.type);
                    debug('material param: ',data.dataModify.param);
                    debug('material val: ',dumbVal);
                    debug('material val: name: ',dumbVal.name);
                    debug('material flagAction: ',flag);
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVal,
                        'flagAction':flag
                    });
                    break;

                //unsortable modifier
                case 'genericDetail':
                    //FIXING random glitch. GLITCH NLP should output this to "purchase" bucket, "save" action. temp fix
                    if (data.dataModify.val[0] == 'buy'){
                        debug('\n\n\n\n\n1I mean is it getting here even?', data)
                        data.bucket = 'purchase';
                        data.action = 'save';
                        ioKip.saveToCart(data);
                    }
                    //normal action here
                    else {
                        debug('\n\n\n\n\n1 Or is it getting here even?', data)
                        debug('genericDetail FIRED!!!');
                        debug('genericDetail type: ',data.dataModify.type);
                        debug('genericDetail param: ',data.dataModify.param);
                        debug('genericDetail val: ',dumbVal);
                        debug('genericDetail val: name: ',dumbVal.name);
                        debug('genericDetail flagAction: ',flag);
                        searchInitial(data,{ // passing special FLAG for search to handle
                            'type':data.dataModify.type,
                            'param':data.dataModify.param,
                            'val':dumbVal,
                            'flagAction':flag
                        });
                    }
                    break;

                case 'brand':
                    searchInitial(data,{ // passing special FLAG for search to handle
                        'type':data.dataModify.type,
                        'param':data.dataModify.param,
                        'val':dumbVal,
                        'flagAction':flag
                    });
                    break;

                default:
                    constructAmazonQuery(); //nm just construct a new query
            }
        }
        else {
            debug('error: data.dataModify params missing')
        }

        function constructAmazonQuery(){

            debug('how is this still firing ??? ');

            async.eachSeries(data.searchSelect, function(searchSelect, callback) {

                var itemAttrib = data.recallHistory.amazon[searchSelect - 1].ItemAttributes; //get selected item attributes

                //DETAILED SEARCH, FIRED IF FLAG weakSearch not on
                if (flag !== 'weakSearch'){
                    debug('weakSearch FALSE');
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
                    debug('weakSearch TRUE');
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
        debug('no Amazon data found in last history item. can not modify search');
        data.action = 'initial';
        searchInitial(data); //do a search anyway
    }


    //after query construction, add modifier and fire search
    function addModifier(){

        cSearch = cSearch.toLowerCase();

        //SORT WHICH TRAITS TO MODIFY
        switch (data.dataModify.type) {
            // CASES: color, size, price, genericDetail
            // case 'color':


            //     // searchInitial(data,{ // passing special FLAG for search to handle
            //     //     'type':data.dataModify.type,
            //     //     'param':data.dataModify.param,
            //     //     'val':dumbVal,
            //     //     'flagAction':flag
            //     // });

            //     // //WHAT DO IF NO PG? NORMAL SEARCH?
            //     // if (data.recallHistory.amazon[searchSelect].ItemAttributes[0].ProductGroup){

            //     //     var productGroup = data.recallHistory.amazon[searchSelect].ItemAttributes[0].ProductGroup[0];
            //     //     var browseNodes = data.recallHistory.amazon[searchSelect].BrowseNodes[0].BrowseNode;

            //     //     debug('!!productGroup <-- ',productGroup);

            //     //     parseAmazon(productGroup,browseNodes,function(res){
            //     //         amazonParams.SearchIndex = res.SearchIndex;
            //     //         amazonParams.BrowseNode = res.BrowseNode;
            //     //         amazonParams.MaximumPrice = modPrice.toString();
            //     //         delete amazonParams.Keywords; //!\!\!\!\ remove so we query by browsenode
            //     //         doSearch();
            //     //     });
            //     // }
            //     // else {
            //     //     debug('Error: Product Group missing from amazon itemAttributes');
            //     //     doSearch();
            //     // }


            //     // //remove colors from item name for new search with new color
            //     // var CSS_COLOR_NAMES = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgrey","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"];
            //     // async.eachSeries(CSS_COLOR_NAMES, function(i, callback) {
            //     //     cSearch = cSearch.replace(i,'');
            //     //     callback();
            //     // }, function done(){
            //     //     cSearch = data.dataModify.val[0].name + ' ' + cSearch; //add new color
            //     //     data.tokens[0] = cSearch; //replace search string in data obj
            //     //     searchInitial(data,flag); //do a new search
            //     // });

            //     break;

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
                if (data.dataModify.val[0] == 'buy'){
                    debug('\n\n\n\n\nI mean is it getting here even?', data)
                    data.bucket = 'purchase';
                    data.action = 'save';
                    ioKip.saveToCart(data);
                }
                //normal action here
                else {
                    debug('\n\n\n\n\nOr is it getting here even?', data)
                    //SORT THROUGH RESULTS OF SIZES, FILTER
                    cSearch = data.dataModify.val + ' ' + cSearch; //add new color
                    data.tokens[0] = cSearch; //replace search string in data obj
                    searchInitial(data,flag); //do a new search
                }
                break;
        }
    }

}

var searchFocus = function(data) {
                        debug('SEARCHKS 922 lol: ',data)

    if (data.searchSelect && data.searchSelect.length == 1){ //we have something to focus on
        if(data.recallHistory && data.recallHistory.amazon){

            // if (data.source.flag && data.source.flag == 'buttonAction'){
            //     var searchSelect = data.searchSelect[0];
            // }
            // else {

            // }

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
                else if (data.recallHistory.amazon[searchSelect].ImageSets && data.recallHistory.amazon[searchSelect].ImageSets[0].ImageSet && data.recallHistory.amazon[searchSelect].ImageSets[0].ImageSet[0].MediumImage && data.recallHistory.amazon[searchSelect].ImageSets[0].ImageSet[0].MediumImage[0]){
                    data.client_res.push(data.recallHistory.amazon[searchSelect].ImageSets[0].ImageSet[0].LargeImage[0].URL[0]);
                }
                //push number emoji + item URL
                processData.getNumEmoji(data,searchSelect+1,function(res){

                    //data.client_res.push('<'+res[count]+' | ' + emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0])+'>');
                    if (data.source.origin !== 'supervisor') {
                     data.client_res.push(res +' <'+ data.recallHistory.urlShorten[searchSelect].trim() + ' | ' + truncate(data.recallHistory.amazon[searchSelect].ItemAttributes[0].Title[0])+'>');
                    } else {
                     data.client_res.push(res +' <'+ data.recallHistory.urlShorten[0].trim() + ' | ' + truncate(data.recallHistory.amazon[searchSelect].ItemAttributes[0].Title[0])+'>');
                    }
                    dumbFunction(); //fire after get
                })

                //pointless ¯\_(ツ)_/¯ ... just makes sure the emoji number + product URL go first in msg order
                function dumbFunction(){
                    //send product title + price
                    //var topStr = attribs.Title[0];

                    var topStr;

                    //if realprice exists, add it to title
                    if (data.recallHistory.amazon[searchSelect].realPrice){
                        topStr = data.recallHistory.amazon[searchSelect].realPrice;
                    }

                    //Make top line bold
                    if (data.source.origin == 'slack' && topStr){
                        topStr = '*'+topStr+'*';
                    }else if (data.source.origin == 'socket.io' && topStr){
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
                        if(data.recallHistory.amazon[searchSelect].reviews.reviewCount){
                            var reviewCounts = ' – ' + data.recallHistory.amazon[searchSelect].reviews.reviewCount + ' reviews';
                        }
                        else {
                            var reviewCounts = '';
                        }
                        data.client_res.push('⭐️ ' +  data.recallHistory.amazon[searchSelect].reviews.rating + reviewCounts);
                    }

                      //----supervisor: making item detail info more digestable on supervisor end ---//
                      if (data.source.origin == 'supervisor') {
                        data.focusInfo = {}
                        if (topStr) data.focusInfo.topStr = topStr
                        if (attribs.Size) data.focusInfo.size = attribs.Size
                        if (attribs.Artist) data.focusInfo.artist = attribs.Artist
                        if (attribs.Brand) data.focusInfo.brand = attribs.Brand
                        if (attribs.Manufacturer) data.focusInfo.manufacturer = attribs.Manufacturer
                        if (attribs.Feature) data.focusInfo.feature = attribs.Feature
                        if (data.recallHistory && data.recallHistory.amazon[searchSelect] && data.recallHistory.amazon[searchSelect].reviews && data.recallHistory.amazon[searchSelect].reviews.rating && reviewCounts) data.focusInfo.reviews = data.recallHistory.amazon[searchSelect].reviews.rating + reviewCounts
                        data.focusInfo.client_res = data.client_res
                      }
                      //--------------------------------------------------------------//

                    ioKip.outgoingResponse(data,'final');

                }

            }else {
                debug('warning: item selection does not exist in amazon array');
                ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
            }
        }else {
            debug('error: amazon search missing from recallHistory obj');
            ioKip.sendTxtResponse(data,'Oops sorry, I\'m not sure which item you\'re referring to');
        }
    }else {
        debug('error: you can only select one item for search focus');
        ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
    }

}


var searchMore = function(data){
    debug('FIRING SEARCHMORE')
    if (data.recallHistory && data.recallHistory.amazon){

        var moreHist = data;

        //build new data obj so there's no mongo duplicate
        data = {};
        data.amazon = moreHist.recallHistory.amazon;
        data.source = moreHist.recallHistory.source;
        data.bucket = moreHist.recallHistory.bucket;
        data.action = moreHist.recallHistory.action;
        data.msg = moreHist.recallHistory.msg;
        data.tokens = moreHist.recallHistory.tokens;
         //----supervisor: reading flags ---//
         if (moreHist.flags) {
             data.flags = moreHist.flags
             data.source = moreHist.source
         }
         //----------------------------------//

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
                    //GET PRICE and review
                    getPrices(data.amazon[i],function(realPrice,altImage,reviews){
                        data.amazon[i].realPrice = realPrice;
                        if (reviews){
                            data.amazon[i].reviews = reviews;
                        }
                        if (altImage){
                           data.amazon[i].altImage = altImage;
                        }
                        callback();
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
        debug('warning: recallHistory missing in searchMore()');
        ioKip.sendTxtResponse(data,'Oops sorry, My brain just broke for a sec, what did you ask?');
    }

}

//* * * * tools for helping with search * * * * //

var getReviews = function(ASIN,callback) {
    //get reviews in circumvention manner (amazon not allowing anymore officially)

      //PROXY SERVICE STUFF
      var url = 'http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+ASIN+'';
      var user = 'alyx';
      var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
      var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com']; //avail proxies
      var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
      var port = '31280';
      var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;

      var proxiedRequest = request.defaults({
        proxy: proxyUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            //'Accept-Encoding':'gzip, deflate, sdch',
            'Accept-Language':'en-US,en;q=0.8',
            'Avail-Dictionary':'qHs1hh9Q',
            'Cache-Control':'max-age=0',
            'Connection':'keep-alive',
            'Cookie': 'x-wl-uid=1QzHcFaAi0nVvunUqsj2QM0aovhwKKa4/z/21QI5ffBtLYVQLyjBJO3g1oE2VXPT9NoEbSMLVwys=; session-token=Gm7LWvhq6XEXLZeKKU42xgF4vP+qspqT1cuuZtgDHBkJJlA3nVQgKQEiHCqTz3i+yy+0wmGd2gTa1mVMwTZlMxlSa2kFxTqaLyMVxw6BKlniNKztf8KYMpxDWuYQdF77DmOJaaWTtl6BbgNhSIQOqVbygqWy1T5JC0iIS6E6Rp0mum33Q3HTTTGo4u+5kmPAbUUDlhGXTmR5EA9d6ygJrFPZAOg+DhSKk1KukwwVmTkSPNGwnOM2bRin7ccXTbiG; csm-hit=03RP10K71JQAZRCBH9VN+s-03RP10K71JQAZRCBH9VN|1459801392100; ubid-main=181-9413107-8193525; session-id-time=2082787201l; session-id=187-3438060-7120357',
            'Host':'www.amazon.com',
            'Origin':'http://www.amazon.com',
            //'Pragma':'no-cache',
            'Upgrade-Insecure-Requests':'1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
            'Referer':url
        }
      });

    proxiedRequest.get(url, function(err, res, body) {
      if(err){
        debug('getReviews error: ',err);
        callback();
      }
      else {

        debug(body);
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
    var altImage;
    var reviews;

    if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice){
        //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
        debug('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

        price = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

    }
    else if (item.ItemAttributes[0].ListPrice){

        debug('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

        if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
            price = '';
        }
        else {
          // add price
          price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
        }
    }

    debug('price PRE PROCESS ',price);

    amazonHTML.basic(url, function(err, product) {
      kip.err(err); // print error

      debug('& & & & & & & & & & & &PRODUCT OBJ ',product);

      if (product.reviews){
        reviews = product.reviews;
      }

      if (product && product.price) {
        debug('returning early with price: ' + product.price);
        debug('returning early with rice ' + product.altImage);
          // if(product.altImage){
          //   altImage = product.altImage;
          // }
        return callback(product.price,product.altImage,reviews)
      }

      debug('product.price: ' + product.price + ', price: ' + price);

      price = product.price || price || '';
      debug('final price: ' + price);
      if(product.altImage){
        altImage = product.altImage;
      }


      callback(price,altImage,reviews);
    })
}


var getAmazonStuff = function(data,results,callback3){

    //!\\ //!\\ NOTE!!! Add timeout here, fire callback if parallel doesnt fire callback!!


    //getting prices and reviews from same source
    async.parallel([

        //* * item 1 * * *//
        function(callback){
            //GET PRICE
            getPrices(results[0],function(realPrice,altImage,reviews){
                var obj = {
                    realPrice:realPrice,
                    reviews:reviews
                }
                if (altImage){
                    obj.altImage = altImage;
                }
                callback(null,obj);
            });
        },

        //* * item 2 * * *//
        function(callback){
            getPrices(results[1],function(realPrice,altImage,reviews){
                var obj = {
                    realPrice:realPrice,
                    reviews:reviews
                }
                if (altImage){
                    obj.altImage = altImage;
                }
                callback(null,obj);
            });
        },

        //* * item 3 * * *//
        function(callback){
            getPrices(results[2],function(realPrice,altImage,reviews){
                var obj = {
                    realPrice:realPrice,
                    reviews:reviews
                }
                if (altImage){
                    obj.altImage = altImage;
                }
                callback(null,obj);
            });
        }
    ],
    function(err, rez){
        if (err){
            debug('Error: parallel getAmazonStuff in search.js ',err);
        }
        var count = 0;
        var loopLame = [0,1,2];
        async.eachSeries(loopLame, function(i, callback) {
            if (data.amazon[i]){

                //add review
                if (rez[count] && rez[count].reviews){
                    debug('add rating');
                    data.amazon[i].reviews = rez[count].reviews;
                }

                //add price
                if(rez[count] && rez[count].realPrice){
                    debug('add real price');
                    data.amazon[i].realPrice = rez[count].realPrice;

                    if(rez[count].altImage){ //adding alt image here as well
                       data.amazon[i].altImage = rez[count].altImage;
                    }
                }

                // else {
                //     debug('/!/ Warning: no reviews or real prices found for current item');
                // }
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


////////// Amazon Specials /////////
function parseAmazon(productGroup,browseNodes,callback5){

    // * * * * * * * *
    // Note: the traverseNodes(browseNodes,['Toys & Games','Clothing, Shoes & Jewelry','Electronics','Office Products']
    //      -----> parts can be re-arranged to improve search results
    //      -----> favor strings related to search index
    // * * * * * * * *

    //SEARCH INDEX:
    // [\n\t\t\t\t\'All\',\'Wine\',\'Wireless\',\'ArtsAndCrafts\',\'Miscellaneous\',\'Electronics\',\'Jewelry\',\'MobileApps\',\'Photo\',
    // \'Shoes\',\'Kindle Store\',\'Automotive\',\'Pantry\',\'MusicalInstruments\',\'DigitalMusic\',\'GiftCards\',\'FashionBaby\',\'FashionGirls\'
    // ,\'GourmetFood\',\'HomeGarden\',\'MusicTracks\',\'UnboxVideo\',\'FashionWomen\',\'VideoGames\',\'FashionMen\',\'Kitchen\',\'Video\',
    // \'Software\',\'Beauty\',\'Grocery\',,\'FashionBoys\',\'Industrial\',\'PetSupplies\',\'OfficeProducts\',\'Magazines\',\'Watches\',
    // \'Luggage\',\'OutdoorLiving\',\'Toys\',\'SportingGoods\',\'PCHardware\',\'Movies\',\'Books\',\'Collectibles\',\'VHS\',\'MP3Downloads\',
    // \'Fashion\',\'Tools\',\'Baby\',\'Apparel\',\'Marketplace\',\'DVD\',\'Appliances\',\'Music\',\'LawnAndGarden\',\'WirelessAccessories\',
    // \'Blended\',\'HealthPersonalCare\',\'Classical\'\n\t\t\t\t].' ]

    var resParams = {};
    switch(productGroup){
        case 'Hobby':
        case 'Toy':
            debug('Toy or Hobby');
            resParams.SearchIndex = 'Toys'; //link product group to searchindex

            //using ['Toys & Games'] here to only search for one string in nodes (can ONLY have up to 3 in arr)
            traverseNodes(browseNodes,['Toys & Games','Clothing, Shoes & Jewelry','Electronics','Office Products'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Pantry':
            debug('pantry');
            resParams.SearchIndex = 'Pantry'; //link product group to searchindex

            //using ['Toys & Games'] here to only search for one string in nodes (can ONLY have up to 3 in arr)
            traverseNodes(browseNodes,['Electronics','Office Products','Health & Personal Care','Grocery & Gourmet Food','Beauty','Baby Products','Toys & Games','Clothing, Shoes & Jewelry'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Book':
            debug('Book');
            resParams.SearchIndex = 'Books'; //link product group to searchindex
            traverseNodes(browseNodes,['Books'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Magazine':
            debug('Magazine');
            resParams.SearchIndex = 'Magazines'; //link product group to searchindex
            traverseNodes(browseNodes,['Magazine Subscriptions','Magazines'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Music':
            debug('music');
            resParams.SearchIndex = 'Music'; //link product group to searchindex
            traverseNodes(browseNodes,['CDs & Vinyl'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Watch':
            debug('watch');
            resParams.SearchIndex = 'Watches'; //link product group to searchindex
            traverseNodes(browseNodes,['Clothing, Shoes & Jewelry','Electronics','Health & Personal Care','Sports & Outdoors'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Digital Music Track':
        case 'Digital Music Album':
            debug('Digital Music Track OR Digital Music Album');
            resParams.SearchIndex = 'DigitalMusic'; //link product group to searchindex
            traverseNodes(browseNodes,['Digital Music'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Entertainment Memorabilia':
        case 'Art':
        case 'Coins':
            debug('Entertainment Memorabilia OR art');
            resParams.SearchIndex = 'Collectibles'; //link product group to searchindex
            traverseNodes(browseNodes,['Collectibles & Fine Art'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Musical Instruments':
            debug('MusicalInstruments');
            resParams.SearchIndex = 'MusicalInstruments'; //link product group to searchindex
            traverseNodes(browseNodes,['Musical Instruments','Electronics','Sports & Outdoors','Toys & Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Photography':
            debug('photo');
            resParams.SearchIndex = 'Photo'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Apparel':
            debug('apparel');
            resParams.SearchIndex = 'Apparel'; //link product group to searchindex
            traverseNodes(browseNodes,['Clothing, Shoes & Jewelry','Baby Products','Beauty','Sports & Outdoors','Health & Personal Care'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Shoes':
            debug('shoes');
            resParams.SearchIndex = 'Shoes'; //link product group to searchindex
            traverseNodes(browseNodes,['Clothing, Shoes & Jewelry','Baby Products','Beauty','Sports & Outdoors'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Wine':
            debug('Wine');
            resParams.SearchIndex = 'Wine'; //link product group to searchindex
            traverseNodes(browseNodes,['Wine'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Personal Computer':
        case 'PC Accessory':
            debug('personal computer OR PC Accessory');
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex  //* *  or: PCHardware
            traverseNodes(browseNodes,['Computers & Accessories','Electronics','Clothing, Shoes & Jewelry','Office Products'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Speakers':
        case 'Network Media Player':
        case 'GPS or Navigation System':
            debug(productGroup);
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Cell Phones & Accessories','Clothing, Shoes & Jewelry','Office Products'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Wireless':
            debug(productGroup);
            resParams.SearchIndex = 'Wireless'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Cell Phones & Accessories','Clothing, Shoes & Jewelry','Sports & Outdoors','Health & Personal Care','Office Products','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Single Detail Page Misc':
            debug(productGroup);
            resParams.SearchIndex = 'Miscellaneous'; //link product group to searchindex
            traverseNodes(browseNodes,['Everything Else'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Art and Craft Supply':
            debug('arts crafts supply');
            resParams.SearchIndex = 'ArtsAndCrafts'; //link product group to searchindex
            traverseNodes(browseNodes,['Painting, Drawing & Art Supplies','Home & Kitchen','Office Products','Clothing, Shoes & Jewelry'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'eBooks':
            debug('kindle store');
            resParams.SearchIndex = 'KindleStore'; //link product group to searchindex
            traverseNodes(browseNodes,['Kindle Store','Books'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Pet Products':
            debug('Pet Products');
            resParams.SearchIndex = 'PetSupplies'; //link product group to searchindex
            traverseNodes(browseNodes,['Pet Supplies','Patio, Lawn & Garden','Electronics','Industrial & Scientific','Toys & Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'CE':
        case 'Home Theater':
            debug('>> CE OR home theater');
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Video Games','Cell Phones & Accessories','Office Products','Sports & Outdoors','Clothing, Shoes & Jewelry','Car Audio or Theater','Industrial & Scientific','Toys & Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Video Games':
        case 'Digital Video Games':
            debug('>> VideoGames OR digital video games');
            resParams.SearchIndex = 'VideoGames'; //link product group to searchindex
            traverseNodes(browseNodes,['Video Games','Gift Cards','Electronics','Office Products','Cell Phones & Accessories','Car Audio or Theater','Sports & Outdoors','Clothing, Shoes & Jewelry'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Gift Card':
        case 'Electronic Gift Card':
            debug('Gift Card or Electronic Gift Card');
            resParams.SearchIndex = 'GiftCards'; //link product group to searchindex
            traverseNodes(browseNodes,['Gift Cards','Apps & Games','Grocery & Gourmet Food','Baby Products','Appliances','Patio, Lawn & Garden','Beauty','Health & Personal Care','Tools & Home Improvement','Painting, Drawing & Art Supplies','Books','Arts, Crafts & Sewing','Pet Supplies','Home & Kitchen','Electronics','Video Games','Office Products','Cell Phones & Accessories','Car Audio or Theater','Sports & Outdoors','Clothing, Shoes & Jewelry','Industrial & Scientific','Kindle Store','Automotive','Movies & TV','Collectibles & Fine Art'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Digital Accessories 1':
        case 'Digital Accessories 2':
        case 'Digital Accessories 3':
            debug('Digital Accessories 1 or 2 or 3');
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex
            traverseNodes(browseNodes,['Kindle Store','Electronics','Video Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Kitchen':
            debug('kitchen');
            resParams.SearchIndex = 'Kitchen'; //link product group to searchindex
            traverseNodes(browseNodes,['Home & Kitchen'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Grocery':
            debug('grocery');
            resParams.SearchIndex = 'Grocery'; //link product group to searchindex
            traverseNodes(browseNodes,['Grocery & Gourmet Food','Baby Products','Beauty'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Wine':
            debug('wine');
            resParams.SearchIndex = 'Wine'; //link product group to searchindex
            traverseNodes(browseNodes,['Grocery & Gourmet Food'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'TV Series Episode Video on Demand':
        case 'Movie':
            debug('tv series Episode video on demand OR Movie');
            resParams.SearchIndex = 'Video'; //link product group to searchindex
            traverseNodes(browseNodes,['Movies & TV'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'DVD':
            debug('DVD');
            resParams.SearchIndex = 'DVD'; //link product group to searchindex
            traverseNodes(browseNodes,['Movies & TV','Electronics','Collectibles & Fine Art'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'VHS':
            debug('VHS');
            resParams.SearchIndex = 'VHS'; //link product group to searchindex
            traverseNodes(browseNodes,['Movies & TV','Electronics','Collectibles & Fine Art'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Baby Product':
            debug('baby product');
            resParams.SearchIndex = 'Baby'; //link product group to searchindex
            traverseNodes(browseNodes,['Baby Products','Clothing, Shoes & Jewelry','Clothing, Shoes & Jewelry','Home & Kitchen'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Home Improvement':
        case 'Tools':
            debug('home improvement');
            resParams.SearchIndex = 'Tools'; //link product group to searchindex
            traverseNodes(browseNodes,['Industrial & Scientific','Appliances','Tools & Home Improvement','Electronics','Automotive','Office Products','Patio, Lawn & Garden'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Guild Product':
            debug('Guild Product');
            resParams.SearchIndex = 'Home & Kitchen'; //link product group to searchindex
            traverseNodes(browseNodes,['Handmade Products','Tools & Home Improvement','Home & Kitchen'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Jewelry':
            debug('Jewelry');
            resParams.SearchIndex = 'Jewelry'; //link product group to searchindex
            traverseNodes(browseNodes,['Clothing, Shoes & Jewelry','Beauty','Apparel'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;


        case 'Major Appliances':
            debug('Major Appliances');
            resParams.SearchIndex = 'Appliances'; //link product group to searchindex
            traverseNodes(browseNodes,['Appliances'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Amazon Tablets':
        case 'Amazon SMP':
            debug('amazon tablets');
            resParams.SearchIndex = 'KindleStore'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Tools & Home Improvement','Kindle Store','Video Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Amazon Home':
            debug('amaazon home');
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Tools & Home Improvement','Kindle Store'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Mobile Application':
        case 'Software':
        case 'Digital Software':
            debug('mobile app OR software');
            resParams.SearchIndex = 'Software'; //link product group to searchindex
            traverseNodes(browseNodes,['Apps & Games','Software','Office Products','Video Games','Toys & Games'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Office Product':
            debug('Office Product');
            resParams.SearchIndex = 'OfficeProducts'; //link product group to searchindex
            traverseNodes(browseNodes,['Office Products','Electronics','Arts, Crafts & Sewing','Tools & Home Improvement','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Jewelry':
            debug('Jewelry');
            resParams.SearchIndex = 'Jewelry'; //link product group to searchindex
            traverseNodes(browseNodes,['Clothing, Shoes & Jewelry','Electronics'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Home':
            debug('home');
            resParams.SearchIndex = 'HomeGarden'; //link product group to searchindex
            traverseNodes(browseNodes,['Home & Kitchen','Arts, Crafts & Sewing','Beauty','Health & Personal Care','Electronics','Clothing, Shoes & Jewelry','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Lawn & Patio':
            debug('Lawn & Patio');
            resParams.SearchIndex = 'LawnAndGarden'; //link product group to searchindex
            traverseNodes(browseNodes,['Patio, Lawn & Garden','Home & Kitchen','Industrial & Scientific','Electronics','Tools & Home Improvement'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Furniture':
            debug('Furniture');
            resParams.SearchIndex = 'HomeGarden'; //link product group to searchindex
            traverseNodes(browseNodes,['Office Products','Arts, Crafts & Sewing','Home & Kitchen','Patio, Lawn & Garden'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Automotive Parts and Accessories':
        case 'Car Audio or Theater':
            debug(productGroup);
            resParams.SearchIndex = 'Automotive'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Health & Personal Care','Automotive','Patio, Lawn & Garden','Cell Phones & Accessories','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Boost':
            debug(productGroup);
            resParams.SearchIndex = 'Electronics'; //link product group to searchindex
            traverseNodes(browseNodes,['Electronics','Health & Personal Care','Automotive','Patio, Lawn & Garden','Cell Phones & Accessories','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Custom Services':
            debug('Custom Services');
            resParams.SearchIndex = 'Miscellaneous'; //link product group to searchindex
            traverseNodes(browseNodes,['Local Business'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;

        case 'Health and Beauty':
            debug('Health and Beauty');
            resParams.SearchIndex = 'HealthPersonalCare'; //link product group to searchindex
            traverseNodes(browseNodes,['Health & Personal Care','Beauty','Sports & Outdoors','Automotive','Electronics','Home & Kitchen','Baby Products','Industrial & Scientific'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Prestige Beauty':
        case 'Beauty':
            debug('Beauty');
            resParams.SearchIndex = 'Beauty'; //link product group to searchindex
            traverseNodes(browseNodes,['Beauty','Health & Personal Care','Grocery & Gourmet Food','Home & Kitchen','Electronics','Tools & Home Improvement'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'Sports':
            debug('Sports');
            resParams.SearchIndex = 'SportingGoods'; //link product group to searchindex
            traverseNodes(browseNodes,['Sports & Outdoors','Clothing, Shoes & Jewelry','Automotive','Toys & Games','Electronics','Collectibles & Fine Art','Grocery & Gourmet Food','Health & Personal Care','Tools & Home Improvement'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        case 'BISS':
        case 'BISS Basic':
            debug('BISS');
            resParams.SearchIndex = 'Industrial'; //link product group to searchindex
            traverseNodes(browseNodes,['Industrial & Scientific','Office Products','Automotive','Beauty','Health & Personal Care','Electronics','Home & Kitchen','Tools & Home Improvement'],function(res){
                resParams.BrowseNode = res;
                callback5(resParams);
            });
        break;
        default:
            debug('Warning: "All" search category fired! this shouldn\'t happen. productGroup is: ',productGroup);
            resParams.SearchIndex = 'All';
            callback5(resParams);
    }
}

function traverseNodes(nodeList,findMe,callbackMM){

    debug(findMe);
    debug(findMe[0]);

    var nodeArr = []; //collect all browse nodes

    async.eachSeries(nodeList, function(item, callbackZ) {

        var currentNode = item;
        var childNodeId = currentNode.BrowseNodeId[0]; //get first ID in nest tree
        var childNodeName = currentNode.Name[0];

        async.whilst(
            function () {
                //authors note: findMe[i] logic a real shit way to check for multiple string matches while traversing nodes
                if (currentNode.Name && findMe.length > 0 && currentNode.Name[0] == findMe[0]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 1 && currentNode.Name[0] == findMe[1]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 2 && currentNode.Name[0] == findMe[2]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 3 && currentNode.Name[0] == findMe[3]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 4 && currentNode.Name[0] == findMe[4]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 5 && currentNode.Name[0] == findMe[5]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 6 && currentNode.Name[0] == findMe[6]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 7 && currentNode.Name[0] == findMe[7]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 8 && currentNode.Name[0] == findMe[8]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 9 && currentNode.Name[0] == findMe[9]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 10 && currentNode.Name[0] == findMe[10]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 11 && currentNode.Name[0] == findMe[11]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 12 && currentNode.Name[0] == findMe[12]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 13 && currentNode.Name[0] == findMe[13]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 14 && currentNode.Name[0] == findMe[14]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 15 && currentNode.Name[0] == findMe[15]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 16 && currentNode.Name[0] == findMe[16]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 17 && currentNode.Name[0] == findMe[17]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 18 && currentNode.Name[0] == findMe[18]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 19 && currentNode.Name[0] == findMe[19]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 20 && currentNode.Name[0] == findMe[20]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 21 && currentNode.Name[0] == findMe[21]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 22 && currentNode.Name[0] == findMe[22]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 23 && currentNode.Name[0] == findMe[23]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 24 && currentNode.Name[0] == findMe[24]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Name && findMe.length > 25 && currentNode.Name[0] == findMe[25]){ //we found the string, stop traversing
                    nodeArr.push(childNodeId);
                    debug('CHILD NAME ',childNodeName);
                    return false;
                }else if (currentNode.Ancestors){ //didn't find string, keep traversing
                    currentNode = currentNode.Ancestors[0].BrowseNode[0];
                    return true;
                }
                else {
                    return false;
                }
            },
            function (callback) {
                callback();
            },
            function (err) {
                if (err){
                    debug('WHILST error in search.js ',err);
                }
                callbackZ();
            }
        );

    }, function done(){
        if (nodeArr.length > 0){
            // debug('arr ',nodeArr);
            // debug('ARRAY LENGTH ',nodeArr.length);
            // if (nodeArr.length >= 2){
            //     nodeArr = nodeArr.slice(0,2);
            // }
            // debug('arr ',nodeArr);
            // debug('ARRAY LENGTH ',nodeArr.length);
            callbackMM(nodeArr.toString());
        }
        else {
            debug('error: no browseNodes found');
            callbackMM();
        }
    });
}


//tools
//trim a string to char #
function truncate(string){
   if (string.length > 48)
      return string.substring(0,48)+'...';
   else
      return string;
};

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
