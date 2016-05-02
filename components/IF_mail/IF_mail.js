process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var promisify = require('promisify-node');

var options = {
	auth: {
		api_user:'IF_mail',
		api_key: 'yLh6_foodistasty_q!WfT]7a',
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
