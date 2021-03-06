var generateQueryString = require('./utils').generateQueryString,
  request = require('request'),
  parseXML = require('xml2js').parseString,
  Promise = require('es6-promise').Promise;

var runQuery = function (credentials, method) {

  return function (query, cb) {

    var url = generateQueryString(query, method, credentials);

    if (typeof cb === 'function') {
      request(url, function (err, response, body) {
        
        if (err) {
          cb(err);
        } else if (!response) {
          cb("No response (check internet connection)");
        } else if (response.statusCode !== 200) {
          parseXML(body, function (err, resp) {
            if (err) {
              cb(err);
            } else {
              cb(resp[method + 'ErrorResponse']);
            }
          });
        } else {
          parseXML(body, function (err, resp) {
            if (err) {
              cb(err);
            } else {
              var respObj = resp[method + 'Response'];
              if (respObj.Items && respObj.Items.length > 0) {
                // Request Error
                if (respObj.Items[0].Request && respObj.Items[0].Request.length > 0 && respObj.Items[0].Request[0].Errors) {
                  cb(respObj.Items[0].Request[0].Errors);
                } else if (respObj.Items[0].Item) {
                  cb(null, respObj.Items[0].Item);
                }
              } 
              else if (respObj.BrowseNodes && respObj.BrowseNodes.length > 0 && respObj.BrowseNodes[0].BrowseNode) {
                cb(null, respObj.BrowseNodes[0].BrowseNode);
              }
              //shopping cart callback
              else if (respObj.Cart && respObj.Cart.length > 0){
                cb(null,respObj.Cart[0]); //send back cart
              }
              else {
                console.log('error: amazon request callback not handled');
              }
            }
          });
        }
      });
      return;
    }

    var promise = new Promise(function (resolve, reject) {

      request(url, function (err, response, body) {

        if (err) {
          console.log('!!!!!!err norm ', err);
          reject(err);
        } else if (!response) {
          reject("No response (check internet connection)");
        } else if (response.statusCode == 503) { //let's try to handle rate limits I guess
          kip.debug('Oh no! AWS is rate limiting me. Let\'s wait a bit')
          setTimeout(() => {
            kip.debug('Ok let\'s go');
            resolve(runQuery(credentials, method)(query,cb)); //should probably find a way to handle infinite recursion
          }, 1500)
        } else if (response.statusCode !== 200) {
          parseXML(body, function(err, resp) {
            console.log('AMAZON QUERY ERROR! in /amazon-product-api_modified/lib/index.js ', JSON.stringify(resp));
            if (err) {
              reject(err);
            } else {
              reject(resp[method + 'ErrorResponse']);
            }
          });
        } else {
          parseXML(body, function (err, resp) {
            if (err) {
              reject(err);
            } else {
              var respObj = resp[method + 'Response'];

              if (respObj.Items && respObj.Items.length > 0) {
                // Request Error
                if (respObj.Items[0].Request && respObj.Items[0].Request.length > 0 && respObj.Items[0].Request[0].Errors) {
                  reject(respObj.Items[0].Request[0].Errors);
                } else if (respObj.Items[0].Item) {
                  resolve(respObj.Items[0].Item);
                }
              } 
              else if (respObj.BrowseNodes && respObj.BrowseNodes.length > 0 && respObj.BrowseNodes[0].BrowseNode) {
                resolve(respObj.BrowseNodes[0].BrowseNode);
              } 
              //shopping cart callback
              else if (respObj.Cart && respObj.Cart.length > 0){
                resolve(respObj.Cart[0]); //send back cart
              }
              else {
                console.log('error: amazon request callback not handled');
              }
            }
          });
        }
      });
    });

    return promise;
  };
};

var createClient = function (credentials) {
  return {
    createCart: runQuery(credentials, 'CartCreate'),
    addCart: runQuery(credentials, 'CartAdd'),
    getCart: runQuery(credentials, 'CartGet'),
    clearCart: runQuery(credentials,'CartClear'),
    similarityLookup: runQuery(credentials, 'SimilarityLookup'),
    itemSearch: runQuery(credentials, 'ItemSearch'),
    itemLookup: runQuery(credentials, 'ItemLookup'),
    browseNodeLookup: runQuery(credentials, 'BrowseNodeLookup')
  };
};

exports.createClient = createClient;