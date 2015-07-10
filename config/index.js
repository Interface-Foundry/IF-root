'use strict';

var path = require('path');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development'
var os = require('os');
var fs = require('fs');

// All configurations will extend these options
// ============================================
var base_config = {
  env: env,
  isProduction: false,
  host: os.hostname(),
  mongodb: {
    url: 'mongodb://localhost:27017/foundry',
    options: {
      server: {
        poolSize: 5,
        socketOptions: {
          keepAlive: 1
        }
      }
    }
  },
  elasticsearch: {
    url: 'http://pikachu.kipapp.co:9200'
  },
  redis: {
    port: 6379,
    url: 'localhost',
    options: {}
  },

  'facebookAuth': {
    'clientID': '1401271990193674', // your App ID
    'clientSecret': '8d7c6cb160c60bd656d8a944d8f1f2bd', // your App Secret
    'callbackURL': 'https://kipapp.co/auth/facebook/callback'
  },

  'twitterAuth': {
    'consumerKey': '79AqE2SPIW219Bx35So7KfTD1',
    'consumerSecret': 'N5SmhOhWzUJwPbofLpCi0BlJ8T4M3bACpiFBaB1nHdNIOQEu6R',
    'callbackURL': 'https://kipapp.co/auth/twitter/callback'
  },

  'meetupAuth': {
    'consumerKey': 'vgmujlff2vflhtutplkaf15h',
    'consumerSecret': 'hub4tmkp966ir5q4jaaa41qc4l',
    'callbackURL': 'https://kipapp.co/auth/meetup/callback'
  },

  neighborhoodServer: {
    url: 'http://localhost:9998'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
if (!fs.existsSync(__dirname + '/' + env + '.js')) {
  throw new Error('Cannot find configuration for environment ' + env);
}

var env_config = require('./' + env + '.js');
module.exports = _.merge(base_config, env_config);

