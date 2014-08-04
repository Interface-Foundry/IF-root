process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
    host: 'localhost',
    port: 25,
    strictSSL: false,
    rejectUnauthorized: false
}));

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Bubblli  <IF@bubbl.li>', // sender address
    to: 'jrbaldwin@interfacefoundry.com', // list of receivers
    subject: 'OFFICIAL LULZ', // Subject line
    text: 'lol', // plaintext body
    html: '<b>hehehehehe</b>' // html body
};

// send mail with defined transport object
transport.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});

module.exports = transport;