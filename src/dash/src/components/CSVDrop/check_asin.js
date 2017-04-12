/*
const async = require('async');
const db = require('db');
const _ = require('lodash');
const co = require('co');
const fs = require('fs');
const rp = require("request-promise");
const csv = require('csvtojson');
var argv = require('minimist')(process.argv.slice(2));
var path = _.get(argv,'_');
var addMonths = require('date-fns/add_months')
var differenceInDays = require('date-fns/difference_in_calendar_days')
if (!path) {
	path = '';
} else {
	path = path[0];
}
var asinC;
var dateC;
var qtyC;
var categoryC;
var deviceC;
var nameC;
const url = "https://www.googleapis.com/urlshortener/v1/url?shortUrl=";
const opt = "&projection=FULL&key=AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk";
var rows = [];
*/

module.exports = function check_asin(rows, items) {
	    var entries = JSON.parse(rows);
	    //console.log('HIYAH!', entries);
	    //console.log('ITEMS', items);
	    var results = [];
        entries.map((row) => 
        	{
                var matches = items.filter(function(i){return i.ASIN == row.ASIN});
                //console.log(matches);
                //console.log('ROWWWWWW', row.Qty, row.Name)
                for(var i = 0; i<row.Qty ; i++){
                  if(i<matches.length){
                  	// console.log(matches[i]);
                    results.push(matches[i]);
                  }
                }

                // matches.map((match) => {
                //     console.log(match);
                // 	results.push(match);
                // });
        		//results.push(matches);
        	}
        );
        //console.log(results);
        return results;
};
/*
		async.eachSeries(rows, function(csvRow, callback){
		 co(function * () {
			let found = false;
			console.log('\nprocessing: ', csvRow,'\n');
			if (csvRow.asin == 'ASIN') return callback()
			console.log('searching items collection...')
			let iResults = yield db.Items.find({$text:{$search:csvRow.asin }}).sort({'_id':-1}).exec();
		  	if (iResults && iResults.length > 0) {
	  		 found = yield processItems(iResults, csvRow, found);
		  	}
		  	if (found) return callback()
		  		*/

/*
			console.log('searching messages collection...')
			let mResults = yield db.Messages.find({$text:{$search:csvRow.asin }}).sort({'_id':-1}).exec();
			if (mResults && mResults.length > 0) {
		  		found = yield processMessages(mResults, csvRow);
	    	  }

		  	if (found) return callback()

        	let data = { id: 'not_found', link_type: null, asin: csvRow.asin, purchase_quantity: csvRow.quantity, platform: null, thread: null, team: null, created_date: null, purchase_date: csvRow.purchaseDate, mongo_id: null};
		    console.log('metric not found..');
		    db.Metrics.log("shopping.link.click", data);

    	    if (found) return callback()

			console.log('searching carts collection...')
	   	  	let cResults = yield db.Carts.find({$text:{$search:csvRow.asin }}).exec();
			if (cResults && cResults.length > 0) {
  		  		found = yield processCarts(cResults, csvRow, found);
			 }
*/
/*
		    callback()

	 	 })//end of co
		}, function(err) {
			console.log('finished!')
		})// end of async
	})//end of csv
}, 5000);
*/

/*
function * processMessages(mResults, csvRow) {
	let found = false;
	yield mResults.map( function * (m) {
		let amazon;
		let asin;
	    if (_.get(m, "amazon")) {
	      // try {
	      //   amazon = JSON.parse(_.get(m, "amazon"));
	      // } catch (err) {
	        var index = m.amazon.indexOf(csvRow.asin);
	        asin = m.amazon.substring(index,index+10);
	        // console.log('could not parse : ', asin);
	   	   // }
	    }
	   	if (!(csvRow.asin.trim() == asin)) {
	      	return console.log('asins do not match: ', csvRow.asin.trim(), asin)
	    }
	  	let thread;
	  	let team;
	    let platform = _.get(m, "source.origin")? _.get(m, "source.origin") : _.get(m, "origin");
	    if (platform == "facebook") {
	      	thread = m.thread_id;
	      } else if (platform == "slack") { 
	        thread = _.get(m, "source.channel");
	        team =  _.get(m, "source.team") ? _.get(m, "source.team") : _.get(m, "source.org");
	      }
	    // let goog;
	    // if (_.get(m,'urlShorten[0]')){
	    //    goog = _.get(m,'urlShorten')[0];
	    // }
	    let existing = yield db.Metrics.find({ "metric":"shopping.link.click", "link_type": "message", "data.asin": csvRow.asin, "data.purchase_date": csvRow.purchaseDate});
		if (existing && existing.length > 0) {
			return console.log('\nmetric exists', existing[0]);
		}
		// let analytics = yield getLinkInfo(goog);
	    let allowance = addMonths(m.ts, 1);
		console.log('\ntime frame:created: ', m.ts, 'purchased: ', csvRow.purchaseDate, ' difference: ', Math.abs(differenceInDays(csvRow.purchaseDate, m.ts))); 
		if(csvRow.purchaseDate > m.ts && csvRow.purchaseDate > allowance) {
			return
		} else if(m.ts > csvRow.purchaseDate) {
			let dayAllowance;
			switch (platform) {
				case 'slack':
					dayAllowance = 10;
					break;
				case 'facebook':
					dayAllowance = 7;
					break;
				case 'socket.io':
					dayAllowance = 3;
					break;
				default:
					dayAllowance = 10;
					break;
			}
			let difference = Math.abs(differenceInDays(m.ts,csvRow.purchaseDate))
			if (difference > dayAllowance) {
			  console.log('\n\n\n\n\ndifferenceInDays: ', difference, ' allowance: ', dayAllowance,'\n\n\n\n\n');
			  return
			} 
		}
	     let data = { id: 'unclear', link_type: 'message', asin: csvRow.asin, title: csvRow.title, purchase_quantity: csvRow.quantity, platform: platform, thread: thread, team: team,created_date: m.ts, purchase_date: csvRow.purchaseDate, mongo_id: m._id};
		 data.team = team;
		 data.thread = thread;
		 data.user = _.get(m, "source.user");
		 if (platform == 'slack') {
		   data.mode = _.get(m, "mode");
		   data.action = _.get(m, "action");
		 }
       	 // data.analytics = analytics;
		 found = true;
	     console.log('\n\nlogged message link click!', data);
		 db.Metrics.log("shopping.link.click", data);

	})// end of map
	return found;
}

*/
/*
function * processItems(iResults, csvRow) {
	let found = false;
 	yield iResults.map(function * (i) {
 		if (!(csvRow.asin.trim() == i.ASIN.trim())) {
    	return console.log('asins do not match: ',csvRow, i.ASIN.trim())
    }
 		let goog = _.get(i,'link');
    let existing = yield db.Metrics.find({ "metric":"shopping.link.click", "data.id": goog, "data.asin": i.ASIN.trim(), "data.cart_id": i.cart_id, "data.added_by": i.added_by});
		if (existing && existing.length > 0) {
			found = true;
			return console.log('\nmetric exists', existing[0]);
		}
  	let allowance = addMonths(i.added_date, 1); 
  	// !((Math.abs(differenceInDays(csvRow.purchaseDate, i.purchased_date)) < 3) && 
 		// if (csvRow.purchaseDate < allowance) { 
			// return console.log('\nout of time frame:created: ',i.purchased_date, 'purchased: ', csvRow.purchaseDate, ' difference: ', differenceInDays(csvRow.purchaseDate, i.purchased_date));
	 	// }
	let platform;
    let team;
    let thread = i.slack_id.toString()
    if(thread.match(/^(facebook_)/)) {
     	platform = 'facebook';
    } else if (thread.charAt(0) == 'T') {
      platform = 'slack';
      team = thread;
    } else if (thread == 'telegram') {
      platform = 'telegram';
    } else {
      platform = 'skype';
    }
 	let data = { id: goog, link_type: 'item', asin: csvRow.asin, title: i.title, image: i.image, added_by: i.added_by, price: i.price, purchase_quantity: csvRow.quantity, thread: thread, platform: platform, device: csvRow.device,cart_id: i.cart_id, created_date: i.added_date, purchase_date: csvRow.purchaseDate, mongo_id: i._id};
 	let analytics = yield getLinkInfo(goog);
 	data.analytics = analytics;
    // if(!analytics) return console.log('link was not clicked!', analytics);
    console.log('\n\nlogged item link click!', data.asin)
    db.Metrics.log("shopping.link.click", data);
    found = true;
 	})
 	return found;
}
*/

/*
function * processCarts(cResults, csvRow) {
	let found = false;
	yield cResults.map( function * (c) {
		let goog = _.get(c,'link'); 
		let existing = yield db.Metrics.find({ "metric":"shopping.link.click", "data.id": goog, "data.asin": csvRow.asin, "data.purchase_date": csvRow.purchaseDate});
		if (existing && existing.length > 0) {
			return console.log('\nmetric exists', existing[0]);
		}
  		let allowance = addMonths(c.created_date, 1); 
	 	if (!((Math.abs(differenceInDays(csvRow.purchaseDate, c.created_date)) < 5 || c.created_date < csvRow.purchaseDate) && csvRow.purchaseDate < allowance)) { 
			return console.log('\nout of time frame:created: ',c.created_date, 'purchased: ', csvRow.purchaseDate, ' difference: ', differenceInDays(csvRow.purchaseDate, c.created_date));
	 	}
 		let cartItems = _.get(c, "amazon.CartItems");
	    let cartRequestItems = _.get(c, "amazon.Request[0].CartCreateRequest[0].Items");
	    let items;
	    if (cartItems &&  cartItems.length > 0) {
	      items = cartItems;
	    } else if (cartRequestItems && cartRequestItems.length > 0) {
	      items = cartRequestItems;
	    }
	    if (!(items && items.length > 0)) {
	      return console.log('empty cart', c);
	    }
	    let thread = _.get(c,'slack_id');
	    let platform;
	    let team;
	    if(thread && thread.match(/^(facebook_)/)) {
	     	platform = 'facebook';
	    } else if (thread.charAt(0) == 'T') {
	      platform = 'slack';
	      team = thread;
	    } else if (thread == 'telegram') {
	      platform = 'telegram';
	    } else {
	      platform = 'skype';
	    }
	    let analytics = yield getLinkInfo(goog);
	    // if(!analytics) return console.log('link was not clicked!', analytics);
	    async.eachSeries(
	    items,
	    function(i, callback) {
	      co(function * () {
	      	let data = { id: goog, link_type: 'cart', asin: csvRow.asin, purchase_quantity: csvRow.quantity, thread: thread, platform: platform, created_date: c.created_date, purchase_date: csvRow.purchaseDate, mongo_id: c._id, aws_client:  _.get(c, "aws_client")};
	        let c_asin = cartItems ? _.get(i, "CartItem[0].ASIN[0]") : _.get(i, "Item[0].ASIN[0]");
	        let c_quantity = cartItems ?  _.get(i, "CartItem[0].Quantity[0]") : _.get(i, "Item[0].Quantity[0]");
	        if (!(csvRow.asin.trim() == c_asin.trim())) {
	        	return console.log('asins do not match: ',csvRow.asin.trim(), c_asin.trim() )
	         }
	      	data.link_analytics = analytics
	        data.cart_quantity = c_quantity;
	        data.title = _.get(i, "CartItem[0].Title[0]") ? _.get(i, "CartItem[0].Title[0]") : undefined;
	        console.log('\n\nlogged cart link click!', data);
	        found = true;
	        db.Metrics.log("shopping.link.click", data);
	        callback();
	      });
	    },
	    function(err) {
	      if (err) { 
	        console.log("async err 63", err) 
	      }
	    }); // end of async iteration
	})
	return found;
}

*/
/*
function * getLinkInfo(goog) {
	var res = yield rp({ url: url + goog + opt, method: "GET" });
	if (!res) {
		
	}
	let analytics;
  try {
    analytics = _.get(JSON.parse(res),'analytics');
  } catch (err) {}

  if (analytics) return analytics
  // let shortClick;
  // let longClick;
  //only log metrics for links that were clicked
  // if (_.get(analytics, "allTime.shortUrlClicks")) {
  //   shortClick = parseFloat(_.get(analytics, "allTime.shortUrlClicks"));
  // }
  // if (_.get(analytics, "allTime.longUrlClicks")) {
  //   longClick = parseFloat(_.get(analytics, "allTime.longUrlClicks"));
  // }
  // if (shortClick > 0 || longClick > 0) {
  //   return analytics
  // } else {
  //   return undefined
  // }
}
*/