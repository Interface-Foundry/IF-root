var slack = require('@slack/client');
var token = 'xoxb-50573012182-9gJAJ1IBPDRjM3xrfcIFdTO1';
var web = new slack.WebClient(token);

var channel = process.env.NODE_ENV === 'production' ? 'G06BTTZGW' : 'D1GGV0CMU'; // G06BTTZGW is back-end devs (D1GGV0CMU is peter <-> prof oak)

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
