var db = require("./db");
var async = require("async");
var _ = require("lodash");
var rp = require("request-promise");
var url = "https://www.googleapis.com/urlshortener/v1/url?shortUrl=";
var opt = "&projection=FULL&key=AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk";
var count = 0;
var co = require('co');

setTimeout(
  function() {
    db.carts
      .find({}, {}, { timeout: true })
      .sort({ "_id": -1 })
      .lean()
      .cursor()
      .on("data", function(doc) {
        let stream = this;
        count++;
        console.log(count);
        let goog = _.get(doc, "link");
        co(function * () {
          var metrics = yield db.Metrics.find({ "metric":"cart.link.click","data.id": goog }).exec();
          // && !(metrics && metrics.length > 0)
          if (!(goog)) {
            return console.log('link is undefined: ', goog);
          } 
          stream.pause();
          let res;
          while (!res || _.get(res,'StatusCodeError') == 403) {
            try {
               res = yield rp({ url: url + goog + opt, method: "GET" })
            } catch(err) {
              if (err) {
                console.log('\n\n\n\n\n\nrate limited, retrying in 3 seconds',err,'\n\n\n\n\n\n'); 
                setTimeout(function (){
                   res = undefined;
                },5000)
              }
            }
          }
          try {
            analytics = _.get(JSON.parse(res),'analytics');
           } catch (err) {
            console.log("\nanalytics parse err: ", err,res,"\n");
          }
          let shortClick;
          let longClick;
          if (_.get(analytics, "allTime.shortUrlClicks")) {
            shortClick = parseFloat(_.get(analytics, "allTime.shortUrlClicks"));
          }
          if (_.get(analytics, "allTime.longUrlClicks")) {
            longClick = parseFloat(_.get(analytics, "allTime.longUrlClicks"));
          }
          if (!(shortClick > 0 || longClick > 0)) {
            return console.log('link was not clicked:', goog);
          }
          let cartItems = _.get(doc, "amazon.CartItems");
          let cartRequestItems = _.get(doc, "amazon.Request[0].CartCreateRequest[0].Items");
          var iterable;
          if (cartItems &&  cartItems.length > 0) {
            iterable = cartItems;
          } else if (cartRequestItems && cartRequestItems.length > 0) {
            iterable = cartRequestItems;
          }
          if (!(iterable && doc.slack_id)) {
            return console.log('empty cart', doc);
          }
          let data = { id: goog, thread: doc.slack_id, platform: '', items: [] };
          data.analytics = analytics;
          data.purchased_date = _.get(doc, "purchased_date");
          data.aws_client = _.get(doc, "aws_client");
          data.cart_mongo_id = doc._id;
          data.ts = doc.created_date;
          if(_.get(data,'thread') && _.get(data,'thread').match(/^(facebook_)/)) {
              data.platform = 'facebook';
          } else if (_.get(data,'thread').charAt(0) == 'T') {
            data.platform = 'slack';
            data.team = _.get(data,'thread');
          } else if (_.get(data,'thread') == 'telegram') {
            data.platform = 'telegram';
          } else {
            data.platform = 'skype';
          }
          async.eachSeries(
            iterable,
            function(i, callback) {
              co(function * () {
                let item = {};
                let asin = cartItems ? _.get(i, "CartItem[0].ASIN[0]") : _.get(i, "Item[0].ASIN[0]");
                let quantity = cartItems ?  _.get(i, "CartItem[0].Quantity[0]") : _.get(i, "Item[0].Quantity[0]");
                if (asin) {
                  item.asin = asin;
                  item.quantity = quantity;
                  item.title = _.get(i, "CartItem[0].Title[0]") ? _.get(i, "CartItem[0].Title[0]") : undefined;
                  //try to determine user who added - expand functionality later
                    if(data.platform == 'slack') {
                     data.team = data.thread;
                      var teams =  yield db.Slackbots.find({'team_id': data.team});
                        var team = _.get(teams,'[0]');
                        if (_.get(team,'meta.office_assistants') && _.get(team,'meta.office_assistants').length >0) {
                          yield _.get(team,'meta.office_assistants').map( function * (u) {
                            let messages = yield db.Messages.find({'source.user': u });
                            if (messages & messages.length > 0) {
                              yield messages.map(function * (m) {
                                  if (_.get(m, "amazon")) {
                                    let flattened = _.flattenDeep(_.get(m, "amazon")).join('');
                                    if (flattened.indexOf(asin) > -1) {
                                       item.addedBy = _.get(m,'source.user');
                                    }
                                  } 
                              });
                            }
                          })
                        } 
                     } 
                  data.items.push(item);
                } 
                callback();
              });
            },
            function(err) {
              if (err) { 
                console.log("async err 63", err) 
              } else {
                data.asins = '';
                data.items.forEach((i) => { data.asins += i.asin });
                db.Metrics.log("cart.link.click", data);
                console.log("logged ", data.platform,':',':',data.ts,':',data.thread);
              }
              stream.resume();
            }); // end of async iteration
       }) //end of co
      })
      .on("error", function(err) {
        if (err)
          console.log(err);
        // handle error
      })
      .on("end", function(res) {
        console.log("finished!", res);
        // final callback
      });
  },
  5000
);