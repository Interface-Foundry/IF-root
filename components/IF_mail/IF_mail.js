process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
	auth: {
		api_user:'IF_mail',
		api_key: 'yLh6_foodistasty_q!WfT]7a',
	}
}

var client = nodemailer.createTransport(sgTransport(options));

module.exports = client;
