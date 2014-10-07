// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '559490587493744', // your App ID
		'clientSecret' 	: '8ddfd8bb11880cb98890373fd45af8c1', // your App Secret
		'callbackURL' 	: 'https://bubbl.li/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: '79AqE2SPIW219Bx35So7KfTD1',
		'consumerSecret' 	: 'N5SmhOhWzUJwPbofLpCi0BlJ8T4M3bACpiFBaB1nHdNIOQEu6R',
		'callbackURL' 		: 'https://bubbl.li/auth/twitter/callback'
	},

	//production
	'meetupAuth' : {
		'consumerKey' 		: 'aoovuf60qkmeot5ed3jk4au0pt',
		'consumerSecret' 	: 'llbldc45u0d4nfabqqmpl4s28q',
		'callbackURL' 		: 'https://bubbl.li/auth/meetup/callback'
	}

	//development
	// 'meetupAuth' : {
	// 	'consumerKey' 		: 'vim0att4d71oa1qjhe1mq1t1dl',
	// 	'consumerSecret' 	: '6qc9nn459v9bbhuui2ceeiqi4e',
	// 	'callbackURL' 		: 'http://localhost:2997/auth/meetup/callback'
	// }

};
