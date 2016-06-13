var slack = require('@slack/client');
debugger;
var token = 'xoxb-50573012182-9gJAJ1IBPDRjM3xrfcIFdTO1';
var web = new slack.WebClient(token);

var channel = 'G06BTTZGW'; // back-end devs

module.exports.say = function(text) {
  var data = {
    username: 'Professor Oak',
    icon_url: 'https://avatars.slack-edge.com/2016-06-13/50574232438_554dfff64aed8d91939e_72.jpg'
  };
  web.chat.postMessage(channel, text, data);
}

if (!module.parent) {
  module.exports.say("Hi I'm Professor Oak.");
}
