'use strict';

var mongoose = require('mongoose');
var emailSchema = mongoose.Schema({

    // Stuff from Sendgrid
    from: String,
    to: String,
    headers: String,
    html: String,
    text: String,
    sender_ip: String,
    subject: String,

    // Stuff we make up ourselves
    chain: String,
    team: String,
    sequence: Number

});

module.exports = mongoose.model('email', emailSchema);
