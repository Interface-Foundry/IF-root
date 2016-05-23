var async = require('async');
var request = require('request');
var fs = require('fs');
var querystring = require('querystring');
const vision = require('node-cloud-vision-api');
var nlp = require('../../nlp/api');
var banter = require("./banter.js");


var googl = require('goo.gl');
if (process.env.NODE_ENV === 'development') {
    googl.setKey('AIzaSyCKGwgQNKQamepKkpjgb20JcMBW_v2xKes')
} else {
    googl.setKey('AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk');
}

//
// Downloads slack file and runs through google vision for image to text search
// Token: pass auth token for slack team to get private url
//
var imageSearch = function(url, slack_token, callback) {
  var options = {
    uri: url
  }

  if (url.indexOf('.slack.com') > 0) {
    options.followRedirect = true;
    options.headers = {
      'Authorization': 'Bearer ' + slack_token
    };
  }

  var savePath = __dirname + '/temp_imgs/' + Math.random().toString(36).substring(7) + '.' + url.split('.').pop().split(/\/|\?|\\|\#/g)[0];

  debugger;

  request(options).pipe(fs.createWriteStream(savePath)).on('close', function() {

    // init with auth
    vision.init({auth: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

    // construct parameters
    const req = new vision.Request({
      image: new vision.Image(savePath),
      features: [
        new vision.Feature('TEXT_DETECTION', 5),
        new vision.Feature('LABEL_DETECTION', 5)
      ]
    })

    // send single request
    vision.annotate(req).then((res) => {
      // handling response
      console.log(JSON.stringify(res.responses));

      var searchTerms = [];

      // //logo detection
      // if(res.responses && res.responses[0].logoAnnotations && res.responses[0].logoAnnotations[0]){
      //   searchTerms.push(res.responses[0].logoAnnotations[0].description);
      // }

      // //text detection
      if(res.responses && res.responses[0].textAnnotations && res.responses[0].textAnnotations[0]){ //only processing english, spanish, french right now
        if (res.responses[0].textAnnotations[0].locale == 'en' || res.responses[0].textAnnotations[0].locale == 'es' || res.responses[0].textAnnotations[0].locale == 'fr'){
          var textEx = res.responses[0].textAnnotations[0].description;
          textEx = textEx.replace(/(\r\n|\n|\r)/gm," "); //remove line breaks
          textEx = textEx.replace(/[\u0250-\ue007]/g, ''); //remove non-latin characters
          textEx = textEx.replace(/^(.{30}[^\s]*).*/, "$1"); //limit # of words
          searchTerms.push(textEx);
        }
      }

      //label detection
      if (searchTerms.length < 1){

        if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[0]){
          searchTerms.push(res.responses[0].labelAnnotations[0].description);
        }

        //lol this code is awful
        if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[1]){
          searchTerms.push(res.responses[0].labelAnnotations[1].description);
        }

        //lol this code is awful
        if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[2]){
          searchTerms.push(res.responses[0].labelAnnotations[2].description);
        }

        //lol this code is awful
        if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[3]){
          searchTerms.push(res.responses[0].labelAnnotations[3].description);
        }

        //lol this code is awful
        if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[4]){
          searchTerms.push(res.responses[0].labelAnnotations[4].description);
        }
      }

      // check for search terms
      if(searchTerms.length > 0){
        console.log(searchTerms);
        callback(Array.from(new Set(searchTerms)).join(" ")); //remove dupes and make into string on return
      }
      else {
        callback();
      }

      fs.unlinkSync(savePath); //remove temp image

    }, (e) => {
      console.log('Error: ', e);
      fs.unlinkSync(savePath); //remove temp image
      callback();
    })

  });
}


/// exports
module.exports = imageSearch;



// test

if (!module.parent) {
  imageSearch('http://ci.santa-rosa.ca.us/SiteCollectionImages/yellow%20cab.jpg', null, done => {
    console.log(done);
  })
}
