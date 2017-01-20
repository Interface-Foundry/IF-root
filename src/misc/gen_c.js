var db = require("/db");
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
        count++;
        console.log(count);
        let stream = this;
        let amazon;
        let goog = _.get(doc, "link");
        if(!goog){
        	console.log('no google url link found: ', doc);
        }
        amazon = _.get(doc, "amazon");
        if (amazon && amazon.CartItems && amazon.CartItems.length > 0) {
          async.eachSeries(
            amazon.CartItems,
            function(i, c) {
              let data = {};
              let asin = _.get(i, "CartItem[0].ASIN[0]");
              if (goog && asin) {
                stream.pause();
                rp({ url: url + goog + opt, method: "GET" }).then(function(
                  res
                ) {
                  try {
                    data.analytics = _.get(JSON.parse(res),'analytics');
                  } catch (err) {
                    console.log(
                      "\n\n\n\n\n\n\n analytics parse err: ",
                      err,
                      "\n\n\n\n\n\n\n"
                    );
                  }
                  let shortClick;
                  let longClick;
                  if (
                   	  _.get(data.analytics, "allTime.shortUrlClicks") &&
                      _.get(data.analytics, "allTime.longUrlClicks")
                  ) {
                    shortClick = parseFloat(
                      _.get(data.analytics, "allTime.shortUrlClicks")
                    );
                    longClick = parseFloat(
                      _.get(data.analytics, "allTime.longUrlClicks")
                    );
                  }
                  if (shortClick > 0 || longClick > 0) {
                    data.id = goog;
                    data.asin = asin;
                    data.title = _.get(i, "CartItem[0].Title[0]");
                    data.thread = doc.slack_id;
                    if (!data.thread) {
                    	console.log('\n\n\n THREAD ID MISSING: ', doc, ' \n\n\n');
                        return setTimeout(c, 800);
                    }
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
					if(data.platform == 'slack') {
					 data.team = data.thread;
					 co(function * () {
					 	var teams =  yield db.slackbots.find({'team_id': data.team});
					    var team = _.get(teams,'[0]');
					    if (_.get(team,'meta.office_assistants') && _.get(team,'meta.office_assistants').length >0) {
					    	yield _.get(team,'meta.office_assistants').map( function * (u) {
					    		let messages = yield db.messages.find({'source.user': u });
					    		if (messages & message.length > 0) {
						    		yield messages.map(function * (m) {
								        if (_.get(m, "amazon")) {
								          var hugeString = _.get(m, "amazon");
								          if (hugeString.indexOf(asin) > -1) {
								          	 data.user = _.get(m,'source.user');
								          }
								        }
						    		});
					    		}
					    	})
					    }	
					 })
					}
                    data.purchased_date = _.get(doc, "purchased_date");
                    data.aws_client = _.get(doc, "aws_client");
                    data.cart_mongo_id = doc._id;
                    data.ts = doc.created_date;
                    db.Metrics.find({ "data.id": goog }, function(err, res) {
                      if (err)
                        return setTimeout(c, 800);
                      if (res && res[0]) {
                        console.log("exists..");
                      } else {
                        db.Metrics.log("cart.link.click", data);

                        console.log("logged ", data.platform,':',data.title,':',data.ts,':',data.thread);
                      }
                      return setTimeout(c, 800);
                    });
                  } else {
                    return setTimeout(c, 800);
                  }
                }, function(err) {
                  console.log(
                    "\n\n\n\n RATE LIMITED: waiting ten seconds  \n\n\n\n"
                  );
                  return setTimeout(c, 10000);
                });
              } else {
                return setTimeout(c, 800);
              }
            },
            function(err) {
              if (err)
                console.log("async err 63", err);
              stream.resume();
            }
          );
        } else {

        	console.log('empty cart');
        }
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