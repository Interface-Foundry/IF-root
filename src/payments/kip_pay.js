/*
	Kip Pay module

      =()=
  ,/'\_||_
  ( (___  `.
  `\./  `=='
         |||
         |||
       , |||   ,                                     ,,,,,,,,,,,
      ;';' ''''' ;,;        ______;;;;______       ,'' ;  ;  ;  ''|||\///
     ,'  ________  ',      |______|;;|______|      ',,_;__;__;__;,'''/\\\
     ;,;'        ';,'        |    |;;|    |         |            |
       '.________.'           '.__|;;|__.'           '.________.'

          Mirugai                Tamago                   Ebi
       (Giant Clam)            (Cooked Egg)             (Shrimp)
*/

// See keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require("stripe")("sk_test_3dsHoF4cErzMfawpvrqVa9Mc"); //NOTE: change to production key
var path = require("path")
var request = require("request")
var crypto = require("crypto")

var mongoose = require("mongoose")
require('kip');
var Payment = db.Payment;
var Slackbot = db.Slackbot;

var bodyParser = require('body-parser')
var express = require("express");
var app = express();
var jsonParser = bodyParser.json()

//base URL for pay.kipthis.com linking
if(process.env.NODE_ENV == 'development_alyx'){
	var baseURL = 'https://b75f53de.ngrok.io'
}else {
	var baseURL = 'https://pay.kipthis.com'
}

//so user can't manipulate charge amounts
//key indexed with kip id passed between front and back end
var orderKey = {}

//this serves the checkout page for new credit card
app.get("/", function(req, res) {
	//GENERATE LINK that has amount
	res.sendFile(path.join(__dirname, 'index.html'))
});

//post a new charge for kip user
app.post("/charge", jsonParser, function(req, res) { 


	//include KEY with new POST req to /charge to verify authentic kip request
	var secret_key = 'mooseLogicalthirteen$*optimumNimble!Cake' 

	//SAMPLE BODY:
	var prunedPay = {
	    _id: String,
	    active: Boolean,
	    team_id: String,
		chosen_location: {
		    addr : {
		        address_1: String,
		        address_2: String,
		        city: String,
		        state: String,
		        zip_code: String,
		        coordinates : []
		    },
		},
	    time_started: Date,
	    convo_initiater: {
	        id : String,
	        name : String,
	        email: String,
	        phone_number: String,
	        first_name: String,
	        last_name: String
	    },
	    chosen_restaurant: {
	        id : String,
	        name : String, //restaurant name
	        url : String //link to delivery.com menu
	    },
	    guest_token: String,
	    order: {
	        total: Number,
	        order_type: String //delivery or pickup
	        //ETC...
	    },
	    saved_card: {
	    	vendor: 'stripe',
	    	customer_id: String,
	    	card_id: String
	    }
	}

	var tester = {
	    "_id": "PAY ID",
	    "active": true,
	    "team_id": "test123",
		"chosen_location": {
		    "addr": {
		        "address_1": "902 Broadway 10010",
		        "address_2": "6F",
		        "city": "New York",
		        "state": "NY",
		        "zip_code": "10010",
		        "coordinates" : []
		    },
		    "special_instructions":"Go to the 12th floor and call 714 330 9056"
		},
	    "time_started": "somedate",
	    "convo_initiater": {
	        "id" : "USER_ID",
	        "name" : "Alyx",
	        "email": "asdf@asdf.com",
	        "phone_number": "723433321",
	        "first_name": "Alyx",
	        "last_name": "Baldwin"
	    },
	    "chosen_restaurant": {
	        "id" : "134234",
	        "name" : "Molcajete Taqueria",
	        "url" : "http://delivery.com"
	    },
	    "guest_token": "GUEST_TOKEN_123123123",
	    "order": {
	        "total": 5000,
	        "order_type": "delivery"
	    }
	}

	//params: 
	//stripe ID 
	//if stripe ID + CC card select, return confirmed payment
	//else return URL to checkout: click here to add credit card (you only need to do this once)

	//NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM 

	if(req.body && req.body.order && req.body.order.total){
		var o = req.body
		//new payment
		var p = new Payment({
			session_token: crypto.randomBytes(256).toString('hex'), //gen key inside object
			order: o
		});
		p.save(function (err, data) {
			if (err) console.log(err);
			else console.log('Saved: ', data );
		});

		//ALREADY A STRIPE USER
		if(o.saved_card && o.saved_card.customer_id){
			//we have card to charge
			if(o.saved_card.card_id){
				charge_by_id(o)
				var v = {
					newAcct: false,
					processing: true,
					msg: 'Processing charge...'
				}

				res.status(200).send(JSON.stringify(v))
			}else {
				//NEED A CARD ID!
				console.log('NEED CARD ID!')
				var v = {
					newAcct: false,
					processing: false,
					msg: 'Error: Card ID Missing!'
				}
				res.status(500).send(JSON.stringify(v))
			}
		}

		//NEW STRIPE USER
		else {

			//return checkout LINK
			var v = {
				newAcct: true,
				processing: false,
				url: baseURL+'?k='+p.session_token
			}

			res.status(200).send(JSON.stringify(v))
		}		

	}else {
		res.status(500).send("Please send a valid number amount to charge user. And include Kip ID 😅. Also email and a description");
	}
});


//get list of cards for user
app.get("/list", function(req, res) {


})

//get session by token
app.post("/session", jsonParser, function(req, res){
	if(req.body && req.body.session_token){
		var t = req.body.session_token.replace(/[^\w\s]/gi, '') //clean special char
		Payment.findOne({session_token: t}, function(err,obj) { 
			res.send(JSON.stringify(obj))
		})
	}
})

//this is the call back from the new credit card to do the charge
app.post("/process", jsonParser, function(req, res) { 

	if(req.body && req.body.token && req.body.session_token){

		//this is a stripe token for the user inputted credit card details
		var token = req.body.token.replace(/[^\w\s]/gi, '') //clean special char
		//LOOK UP USER BY HASH TOKEN 
		var t = req.body.session_token.replace(/[^\w\s]/gi, '') //clean special char

		Payment.findOne({session_token: t}, function(err,pay) { 

			if (err){
				console.log(err)
			}else {
				var customer_id;
				//create stripe customer 
				stripe.customers.create({
				  source: token,
				  description: 'Delivery.com & Kip: ' + pay.order.chosen_restaurant.name
				}).then(function(customer) {
				  customer_id = customer.id
				  return stripe.charges.create({
				    amount: pay.order.order.total, // Amount in cents
				    currency: "usd",
				    customer: customer.id
				  });

				}).then(function(charge) {

					console.log('STRIPE CUSTOER^#^$#&$^#$&#^$#&$^#$ ',charge)

					if(charge){
						pay.charge = charge
					    pay.save(function (err,x) {
					        if(err) {
					            console.error('ERROR!');
					        }
					        console.log('UPDATED PAY ORDER',x)
					    });
					}
					
					if (charge.status == 'succeeded'){

						//save stripe info to slack team
						Slackbot.findOne({team_id: pay.order.team_id}, function(err,obj) { 

							console.log('& & & & & ',obj)
							//update stripe / push cards into array
							if(err){
								console.error('error: cant find team to save stripe info')
							}else {
								if(!obj.meta.payments){
									obj.meta.payments = []
								}
							   	//save card / stripe acct to slack team
								obj.meta.payments.push({
									vendor: 'stripe',
									customer_id: customer_id,
									card:{
										card_id: charge.source.id,
										brand: charge.source.brand, //visa, mastercard, etc
										exp_month: charge.source.exp_month, 
										exp_year: charge.source.exp_year,
										last4: charge.source.last4, 
										address_zip: charge.source.address_zip,
										email: charge.source.name //this should work...
									}
								})

							    obj.save(function (err,z) {
							        if(err) {
							            console.error('ERROR!');
							        }
							        console.log('UPDATED TEAM ',z)
							    });
							}

						
							//pay delivery.com							
							pay_delivery_com(pay,charge,function(err,outcome){
								//message 
								console.log(err)
								console.log(outcome)

								//* * * * * * * * * * * //
								//IF SUCCESS, POST TO MONGO QUEUE PUBLISH
								//* * * * * * * **  ** //

							})
						})	
					}
					else {
						console.log('DIDNT PROCESS STRIPE CHARGE: ',charge.status)
						console.log('OUTCOME: ',charge.outcome)
					}

				});			
			}
		})


	}
});

//make a charge 
function charge_by_id(o){
	// STRIPE CHARGE BY ID 
	// When it's time to charge the customer again, retrieve the customer ID!
	stripe.charges.create({
	  amount: amount, // Amount in cents
	  currency: "usd",
	  customer: customerId, // Previously stored, then retrieved
	  card: cardId
	}).then(function(charge){
		console.log('CHARGED?? ',charge)
	});		
	return 'success?'
}

//pay delivery.com
function pay_delivery_com(pay,charge,callback){

	var err = null //lol idk 

	//payment amounts should match
	if(charge.amount == pay.order.order.total){

		//POST /api/guest/cart/{merchant_id}/checkout

		// {
		//    "order_type":"delivery",
		//    "order_time":"ASAP",
		//    "street":"199 Water St",
		//    "city":"New York",
		//    "state":"NY",
		//    "zip_code":"10038",
		//    "payments":[
		//       {
		//          "type":"credit_card",
		//          "card":{
		//             "cc_number":"4111111111111111",
		//             "exp_year":"2024",
		//             "exp_mon":"08",
		//             "cvv":"123",
		//             "billing_zip":"11223",
		//             "save":false
		//          }
		//       }
		//    ],
		//    "instructions":"",
		//    "sms_notify":false,
		//    "isOptingIn" : true,
		//    "phone_number":"2125551212",
		//    "tip":"3.90",
		//    "merchant_id":"69391",
		//    "first_name":"sa",
		//    "last_name":"yo",
		//    "email":"sa@yo.com",
		//    "client_id":"xxxxxxxxxxxxxxxx",
		//    "uhau_id" : 12345
		// }	

	}
	else {
		err = 'ERROR: Charge amounts dont match D:'
		callback(err)
	}
	

}

// function sendPayment(order){

// 	switch(order.service){
// 		case 'delivery.com':

// 			//POST /api/guest/cart/{merchant_id}/checkout

// 			// {
// 			//    "order_type":"delivery",
// 			//    "order_time":"ASAP",
// 			//    "street":"199 Water St",
// 			//    "city":"New York",
// 			//    "state":"NY",
// 			//    "zip_code":"10038",
// 			//    "payments":[
// 			//       {
// 			//          "type":"credit_card",
// 			//          "card":{
// 			//             "cc_number":"4111111111111111",
// 			//             "exp_year":"2024",
// 			//             "exp_mon":"08",
// 			//             "cvv":"123",
// 			//             "billing_zip":"11223",
// 			//             "save":false
// 			//          }
// 			//       }
// 			//    ],
// 			//    "instructions":"",
// 			//    "sms_notify":false,
// 			//    "isOptingIn" : true,
// 			//    "phone_number":"2125551212",
// 			//    "tip":"3.90",
// 			//    "merchant_id":"69391",
// 			//    "first_name":"sa",
// 			//    "last_name":"yo",
// 			//    "email":"sa@yo.com",
// 			//    "client_id":"xxxxxxxxxxxxxxxx",
// 			//    "uhau_id" : 12345
// 			// }
// 		break;
// 	}

// 	// {
// 	// 	"amount":"888000",
// 	// 	"kipId":"slack_TEAMID_USERID",
// 	// 	"description":"Los Alamos Cantina",
// 	// 	"email":"hello@kipthis.com",
// 	// 	"order":{
// 	// 		"service":"delivery.com",
			
// 	// 	}
// 	// }

// }


function chargeToken(token,order,callback){

	//create Stripe charge using this credit card token
	var charge = stripe.charges.create({
	  amount: order.amount, 
	  currency: "usd",
	  source: token,
	  description: order.description

	}, function(err, charge) {

		callback(charge,err)

		// if (err && err.type === 'StripeCardError') {
		// 	// The card has been declined
		// 	console.log('STRIPE CHARGE ',err)



		// 	// 	switch (err.type) {
		// 	// 	  case 'StripeCardError':
		// 	// 	    // A declined card error
		// 	// 	    //send msg back to user card exp.
		// 	// 	    break;
		// 	// 	  case 'RateLimitError':
		// 	// 	    // Too many requests made to the API too quickly
		// 	// 	    break;
		// 	// 	  case 'StripeInvalidRequestError':
		// 	// 	    // Invalid parameters were supplied to Stripe's API
		// 	// 	    break;
		// 	// 	  case 'StripeAPIError':
		// 	// 	    // An error occurred internally with Stripe's API
		// 	// 	    break;
		// 	// 	  case 'StripeConnectionError':
		// 	// 	    // Some kind of error occurred during the HTTPS communication
		// 	// 	    break;
		// 	// 	  case 'StripeAuthenticationError':
		// 	// 	    // You probably used an incorrect API key
		// 	// 	    break;
		// 	// 	  default:
		// 	// 	    // Handle any other types of unexpected errors
		// 	// 	    break;
		// 	// 	}

		// 	//should return err back to /process so we can display to user
		// }
		// else {
			
		// }

	});	
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});
