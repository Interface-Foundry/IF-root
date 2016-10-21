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
mongoose.connect('mongodb://localhost/pay')
var db = mongoose.connection
var Schema = mongoose.Schema

var paySchema = new Schema({
	amount: Number,
	description: String,
	email: String,
	kipId: String,
	session_token: { type: String, index: true }, //gen key inside object
	customerId: String,
	cardId: String,
	ts : { type : Date, default: Date.now }
});
var Payment = mongoose.model('Payment', paySchema);

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
	// 	accountId: 'ch_196ncTI2kQvuYJlVN9tBu4or',
	// 	cardId: 'card_196ncPI2kQvuYJlVNuHXNqcZ',
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

		//SAVE ORDER + KEY
		// //update orderKey with charge value
		// orderKey[req.body.kipId] = {
		// 	amount: req.body.amount,
		// 	description: req.body.description,
		// 	email: req.body.email,
		// 	kipId: req.body.kipId,
		// 	session_token: crypto.randomBytes(256).toString('hex'), //gen key inside object
		// 	customerId: '1212121212',
		// 	cardId: '12121212'
		// }

		var p = new Payment({
			amount: req.body.amount,
			description: req.body.description,
			email: req.body.email,
			kipId: req.body.kipId,
			session_token: crypto.randomBytes(256).toString('hex'), //gen key inside object
			customerId: req.body.customerId,
			cardId: req.body.cardId
		});
		 
		p.save(function (err, data) {
			if (err) console.log(err);
			else console.log('Saved : ', data );
		});


		//ALREADY A STRIPE USER
		if(req.body.customerId){

			if(req.body.cardId){

				chargebyId(req.body.customerId,req.body.cardId,req.body.amount)

			}else {
				//NEED A CARD ID!
				console.log('NEED CARD ID!')
			}

		//NEW STRIPE USER
		}else {

			//return checkout LINK
			var v = {
				newAcct: true,
				url: baseURL+'?k='+p.session_token
				//STORE TOKEN ON KIP PAY END
			}

			//change to generated token on kip pay end. store token
			//user clicks link
		}

		//send charge res back 
		res.status(200).send(JSON.stringify(v))


	}else {
		res.status(500).send("Please send a valid number amount to charge user. And include Kip ID 😅. Also email and a description");
	}
});

function chargebyId(customerId,cardId,amount){
	// STRIPE CHARGE BY ID 
	// When it's time to charge the customer again, retrieve the customer ID!
	stripe.charges.create({
	  amount: amount, // Amount in cents
	  currency: "usd",
	  customer: customerId, // Previously stored, then retrieved
	  card: cardId
	}).then(function(z){
		console.log('CHARGED?? ',z)
	});		
	return 'success?'
}


//get list of cards for user
app.get("/list", function(req, res) {


})

app.post("/session", jsonParser, function(req, res){

	if(req.body && req.body.session_token){

		var t = req.body.session_token.replace(/[^\w\s]/gi, '') //clean special char

		Payment.findOne({session_token: t}, function(err,obj) { 
			console.log('$$$$$$$$$$$ ',obj)
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

		Payment.findOne({session_token: t}, function(err,obj) { 

			if (err){
				console.log(err)
			}else {
				//create stripe customer 
				stripe.customers.create({
				  source: token,
				  description: obj.description
				}).then(function(customer) {
				  return stripe.charges.create({
				    amount: obj.amount, // Amount in cents
				    currency: "usd",
				    customer: customer.id
				  });

				}).then(function(charge) {
				  // YOUR CODE: Save the customer ID and other info in a database for later!

				  console.log('STRIPE CUSTOER^#^$#&$^#$&#^$#&$^#$ ',charge)

				  //SENDING BACK TO KIP CAFE
				});			
			}
		})


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
