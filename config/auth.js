// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '559490587493744', // your App ID
		'clientSecret' 	: '8ddfd8bb11880cb98890373fd45af8c1', // your App Secret
		'callbackURL' 	: 'http://bubbl.li/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: '79AqE2SPIW219Bx35So7KfTD1',
		'consumerSecret' 	: 'N5SmhOhWzUJwPbofLpCi0BlJ8T4M3bACpiFBaB1nHdNIOQEu6R',
		'callbackURL' 		: 'http://bubbl.li/auth/twitter/callback'
	}
};
