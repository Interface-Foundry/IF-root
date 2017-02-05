process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var promisify = require('promisify-node');

var options = {
	auth: {
		api_user:'IF_mail',
		api_key: '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',
	}
}

var client = nodemailer.createTransport(sgTransport(options));

module.exports = client;

client.send = function(payload) {
	return new Promise(function(resolve, reject) {
		client.sendMail(payload, function(e) {
			if (e) { reject(e) } else { resolve() }
		})
	})
}
