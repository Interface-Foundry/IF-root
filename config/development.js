'use strict';

// find the local ip address
var request = require('sync-request');
var res = request('GET', 'http://icanhazip.com');

// Development specific configuration
// ==================================
module.exports = {
  ip: res.body.toString().replace(/\s/g, ''),
  geoipURL: 'web-server-charmander.kipapp.co:8080',
  facebookAuth: {
    callbackURL: 'http://localhost.kipapp.co/auth/facebook/callback'
  }

  // FACEBOOK_ID:      'app-id',
  // FACEBOOK_SECRET:  'secret',

  // // MongoDB connection options
  // mongo: {
  //   uri: 'mongodb://localhost/app'
  // },

// seedDB: true
};
