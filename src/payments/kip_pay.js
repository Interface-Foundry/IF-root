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

var bodyParser = require('body-parser')

var express = require("express");
var app = express();
var jsonParser = bodyParser.json()

//replacing with SSL kipthis.com domain
var baseURL = 'https://b75f53de.ngrok.io'

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

	//sample body
	// req.body = {
	// 	amount: 2000,
	// 	stripeId: '12341234',
	// 	cc: 'abc',
	//	kipId: 'slack_123123_213123' (origin + team + user id),
	//  description: 'Los Alamos Cantina',
	//	email: 'hello@kipthis.com'
	// }

	//params: 
	//stripe ID 
	//if stripe ID + CC card select, return confirmed payment
	//else return URL to checkout: click here to add credit card (you only need to do this once)

	//NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM 

	if(req.body && req.body.amount && !isNaN(req.body.amount) && req.body.kipId && req.body.email){

		console.log(req.body)

		//update orderKey with charge value
		orderKey[req.body.kipId] = {
			amount: req.body.amount,
			description: req.body.description
		}

		if(req.body.stripeId){
			//check for cc val
			var v = {
				newAcct: false,
			}

		}else {
			//return checkout LINK
			var v = {
				newAcct: true,
				url: baseURL+'?k='+encodeURI(req.body.kipId)+'&a='+req.body.amount+'&d='+encodeURI(req.body.description)+'&e='+encodeURI(req.body.email)
			}
		}

		//send charge res back 
		res.status(200).send(JSON.stringify(v))


	}else {
		res.status(500).send("Please send a valid number amount to charge user. And include Kip ID 😅. Also email and a description");
	}
});


//get list of cards for user
app.get("/list", function(req, res) {

});

//this is the call back from the new credit card to do the charge
app.post("/process", jsonParser, function(req, res) { 

	res.sendStatus(200)

	if(req.body && req.body.token){

		//this is a stripe token for the user inputted credit card details
		var token = req.body.token

		//check if we have order for this kip id user
		if (!orderKey[req.body.kipId]){
			console.error('err: cant find order key')
		}else {
			chargeToken(token,orderKey[req.body.kipId],function(charge){

				console.log(charge)
			})
		}

	}
});

function chargeToken(token,order,callback){

	//create Stripe charge using this credit card token
	var charge = stripe.charges.create({
	  amount: order.amount, 
	  currency: "usd",
	  source: token,
	  description: order.description

	}, function(err, charge) {
		
		if (err && err.type === 'StripeCardError') {
			// The card has been declined
			console.log('STRIPE CHARGE ',err)

			// 	switch (err.type) {
			// 	  case 'StripeCardError':
			// 	    // A declined card error
			// 	    //send msg back to user card exp.
			// 	    break;
			// 	  case 'RateLimitError':
			// 	    // Too many requests made to the API too quickly
			// 	    break;
			// 	  case 'StripeInvalidRequestError':
			// 	    // Invalid parameters were supplied to Stripe's API
			// 	    break;
			// 	  case 'StripeAPIError':
			// 	    // An error occurred internally with Stripe's API
			// 	    break;
			// 	  case 'StripeConnectionError':
			// 	    // Some kind of error occurred during the HTTPS communication
			// 	    break;
			// 	  case 'StripeAuthenticationError':
			// 	    // You probably used an incorrect API key
			// 	    break;
			// 	  default:
			// 	    // Handle any other types of unexpected errors
			// 	    break;
			// 	}

			//should return err back to /process so we can display to user
		}
		else {
			callback(charge)
		}

	});	
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});
