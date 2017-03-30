'use strict'

var mongoose = require('mongoose')
// https://schema.org/EmailMessage
var emailSchema = mongoose.Schema({

  // Stuff from Sendgrid
  from: String,
  to: String,
  to_user: {type: mongoose.Schema.Types.ObjectId, ref: 'Email_User'}, // recipient
  from_user: {type: mongoose.Schema.Types.ObjectId, ref: 'Email_User'}, // sender

  headers: String, // what is this
  html: String,
  text: String,
  sender_ip: String,
  subject: String,

  // Stuff we make up ourselves
  chain: String,
  team: String,
  sequence: Number

})

module.exports = mongoose.model('email', emailSchema)
