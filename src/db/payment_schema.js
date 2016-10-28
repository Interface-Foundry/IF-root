'use strict'

var mongoose = require('mongoose')
var paymentSchema = mongoose.Schema({
  session_token: { type: String, index: true }, //gen key inside object
  ts: { type : Date, default: Date.now },
  order: {},
  charge: {}
})

module.exports = mongoose.model('Payment', paymentSchema)