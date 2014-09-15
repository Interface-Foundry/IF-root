var strings = require('./strings');

var CREDENTIAL_ACCESS_TOKEN = {
  access_token: strings.ACCESS_TOKEN
};

var CREDENTIAL_CLIENT = {
  client_id: strings.CLIENT_ID,
  client_secret: strings.CLIENT_SECRET
};

exports.CREDENTIAL_LIST = [CREDENTIAL_ACCESS_TOKEN, CREDENTIAL_CLIENT];
