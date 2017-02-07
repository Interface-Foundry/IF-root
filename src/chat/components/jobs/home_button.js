var request = require('request-promise');
var co = require('co');
module.exports = function(agenda) {
  agenda.define('append home', function(job, done) {
    let message = JSON.parse(job.attrs.data.msg);
    let hasHome = checkForHome(message);
    let attachments = message.attachments;
    if (!hasHome) {
      co(function * () {
        attachments = attachments.map(a => {
          a.text = a.text ? a.text : '';
          return a;
        });
        attachments.push({
          text: '',
          callback_id: 'appendedHome',
          actions: [{
            name: 'passthrough',
            text: 'Home',
            style: 'default',
            type: 'button',
            value: 'home'
          }]
        });
        request.post({
          url: 'https://slack.com/api/chat.update',
          json: true,
          form: {
            token: job.attrs.data.token,
            ts: message.ts,
            channel: job.attrs.data.channel,
            as_user: true,
            attachments: stringify(attachments),
            text: message.text
          }
        })
        .then(res => kip.debug(`♻️  Tried to add home button, res is:\n${JSON.stringify(res, null, 2)}`))
        .catch(err => kip.debug(`😡 Couldn't add home, err is:\n${JSON.stringify(err, null, 2)}`))
        .then(() => done());
      });
    }
  });
};

function checkForHome(message) {
  let isHome = false;
  message.attachments.forEach(a => {
    if (a.actions && !isHome) {
      a.actions.forEach(b => {
        if (b.text === 'Home' || (a.text && a.text.includes('Kip Store'))) {
          isHome = true;
        }
      });
    }
  });
  return isHome;
}

function stringify(text) {
  let stringOrig = JSON.stringify(text, '\n');
  stringOrig = stringOrig.replace(/[\u007F-\uFFFF]/g, function(chr) {
    return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
  });
  let map = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#039': '\''
  };
  stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c]);
  return stringOrig;
}