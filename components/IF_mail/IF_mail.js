process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
    host: 'localhost',
    port: 25,
    strictSSL: false,
    rejectUnauthorized: false
}));

module.exports = transport;