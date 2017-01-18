const async = require('async');
const db = require('db');
const _ = require('lodash');
const co = require('co');
const fs = require('fs');
const csv = require('csvtojson');
var argv = require('minimist')(process.argv.slice(2));
var path = _.get(argv,'_');
var addMonths = require('date-fns/add_months')
if (!path) {
	return console.log('invalid csv path.');
} else {
	path = path[0];
}
var asinC;
var dateC;
var qtyC;
var categoryC;
var deviceC;
setTimeout(function() {
	csv()
	.fromFile(path)
	.on('json',(jsonObj)=>{
		Object.keys(jsonObj).forEach(function(key) {
		 if (jsonObj[key].indexOf('Category') > -1) {
		    categoryC = key;
		  } else if (jsonObj[key].indexOf('ASIN') > -1) {
		  	asinC = key
		  } else if (jsonObj[key].indexOf('Date') > -1) {
		  	dateC = key
		  } else if (jsonObj[key].indexOf('Qty') > -1) {
		  	qtyC = key
		  } else if (jsonObj[key].indexOf('Device Type') > -1) {
		  	deviceC = key
		  }
		});
		let asin;
		let date;
		let quantity;
		let category;
		let device;
		Object.keys(jsonObj).forEach(function(key) {
			switch(key) {
			  case asinC:
			  	asin = jsonObj[key]
			  	break;
			  case dateC:
			  	date = jsonObj[key]
			  	break;
			  case qtyC:
			  	quantity = jsonObj[key]
			  	break;
			  case categoryC:
			  	category = jsonObj[key]
			  	break;
			  case deviceC:
			  	device = jsonObj[key]
			  	break;
			  default:
			  	break;	
			}
		 });
		co(function * () {
		  let ilm = yield db.metrics.find({'metric':'item.link.click','data.asin': asin });
		  if (ilm && ilm.length > 0) {
	  		yield ilm.map( function * (m) {
	  			let purchaseDate = new Date(date);
				let allowance = addMonths(m.data.ts, 3);
	  			if ((purchaseDate > m.data.ts ) && (purchaseDate < allowance)) {
	  			  let qkey;
		  		  if (m.data.platform == 'facebook') {
	  				qkey = m.data.thread_id;	
		   		  } else if (m.data.platform == 'slack') {
	   				qkey = m.data.team;
		   		  }
  		   		  let cs = yield db.carts.find({'slack_id': qkey});
  	  			  console.log('\n found asin falling within 3 months: asin:',m.data.asin,' for cart: ', qkey,'\n');
		   		  m.data.category = category ? category : null;
		   		  m.data.purchased = date ? date : null;
	  			  m.data.purchase_quantity = quantity ? quantity : null;
	  			  m.data.device = device ? device : null;
		  		  yield m.save();
				  if (cs && cs[0]) {
					_.set(cs[0],'amazon.CartItems',[]);
					_.set(cs[0],'items',[]);
					_.set(cs[0],'aggregate_items',[]);
					_.set(cs[0],'amazon.PurchaseURL',[]);
					_.set(cs[0],'amazon.SubTotal',[]);
					cs[0].link = '';
					cs[0].markModified('items');
					cs[0].markModified('aggregate_items');
					cs[0].markModified('amazon.CartItems');
					cs[0].markModified('amazon.PurchaseURL');
					cs[0].markModified('amazon.SubTotal');
					yield cs[0].save(function (err,res){
					  if (err) console.log('save cart err: ', err);
					  m.data.cart_cleared = Date.now();
					  m.save();
					  console.log('Cart cleared for:', qkey, 'final metric: ', m);
					});
				  }
	  			} else {
	  				console.log('skipping asin:',m.data.asin);
				}
	  		})
		   }
   		   let clm = yield db.metrics.find({'metric':'cart.link.click','data.asin': asin });
		   if (clm && clm.length > 0) {
	  		yield clm.map( function * (m) {
	  			let purchaseDate = new Date(date);
				let allowance = addMonths(m.data.ts, 3);
	  			if ((purchaseDate > m.data.ts ) && (purchaseDate < allowance)) {
		  			let qkey;
		  			if (m.data.platform == 'facebook') {
		  				qkey = m.data.thread_id;	
		   			} else if (m.data.platform == 'slack') {
		   				qkey = m.data.team;
		   			}
	  				console.log('\n found asin falling within 3 months: asin:',m.data.asin,' for cart: ', qkey,'\n');
		   			m.data.category = category ? category : null;
		   		    m.data.purchased = date ? date : null;
	  			    m.data.purchase_quantity = quantity ? quantity : null;
	  			    m.data.device = device ? device : null;
		  			yield m.save();
		   			let cs = yield db.carts.find({'slack_id': qkey});
					if (cs && cs[0]) {
						_.set(cs[0],'amazon.CartItems',[]);
						_.set(cs[0],'items',[]);
						_.set(cs[0],'aggregate_items',[]);
						_.set(cs[0],'amazon.PurchaseURL',[]);
						_.set(cs[0],'amazon.SubTotal',[]);
						cs[0].link = '';
						cs[0].markModified('items');
						cs[0].markModified('aggregate_items');
						cs[0].markModified('amazon.CartItems');
						cs[0].markModified('amazon.PurchaseURL');
						cs[0].markModified('amazon.SubTotal');
						yield cs[0].save(function  (err,res){
						  if (err) console.log('save cart err: ', err);
						  m.data.cart_cleared = Date.now();
						  m.save();
	  					  console.log('Cart cleared for:', qkey, 'final metric: ', m);
						});
					}
				} else {
	  				console.log('skipping asin:',m.data.asin);
				}
	  		})
		   }
	 	 })
	})
	.on('done',(error)=>{
	    console.log('end')
	})
}, 5000)

