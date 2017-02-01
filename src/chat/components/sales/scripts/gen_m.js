//csv verified 

var db = require("./db");
var async = require("async");
var _ = require("lodash");
var rp = require("request-promise");
var url = "https://www.googleapis.com/urlshortener/v1/url?shortUrl=";
var opt = "&projection=FULL&key=AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk";
var count = 0;

setTimeout(
  function() {
    db.messages
      .find({}, {}, { timeout: true })
      .sort({ "_id": -1 })
      .lean()
      .cursor()
      .on("data", function(doc) {
        count++;
        console.log(count);
        let stream = this;
        let amazon;
        if (_.get(doc, "amazon")) {
          try {
            amazon = JSON.parse(doc.amazon);
          } catch (err) {}
        }
        if (amazon && amazon.length > 0) {
          async.eachSeries(
            amazon,
            function(i, c) {
              let data = {};
              let goog = _.get(i, "shortened_url");
              if(!goog){
		        console.log('no google url link found: ', doc, i);
		      }
              let asin = _.get(i, "ASIN[0]");
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
                  //only log metrics for links that were clicked
                  if (_.get(data.analytics, "allTime.shortUrlClicks")) {
                    shortClick = parseFloat(_.get(data.analytics, "allTime.shortUrlClicks"));
                  }
                  if (_.get(data.analytics, "allTime.longUrlClicks")) {
                    longClick = parseFloat(_.get(data.analytics, "allTime.longUrlClicks"));
                  }
                  if (shortClick > 0 || longClick > 0) {
                    data.id = goog;
                    data.asin = asin;
                    data.title = _.get(i, "ItemAttributes[0].Title[0]");
                    data.platform = _.get(doc, "source.origin")
                      ? _.get(doc, "source.origin")
                      : _.get(doc, "origin");
                    if (data.platform == "facebook") {
                      data.thread = doc.thread_id;
                    } else if (data.platform == "slack") { 
                      data.thread = _.get(doc, "source.channel");
                      data.team =  _.get(doc, "source.team");
                    }
                    data.user = _.get(doc, "source.user");
                    data.mongo_id = doc._id;
                    data.mode = _.get(doc, "mode");
                    data.action = _.get(doc, "action");
                    data.ts = doc.ts;
                    db.Metrics.find({ "data.id": goog }, function(err, res) {
                      if (err)
                        return setTimeout(c, 800);
                      if (res && res[0]) {
                        console.log("exists..");
                      } else {
                        db.Metrics.log("item.link.click", data);
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
        } else {}
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