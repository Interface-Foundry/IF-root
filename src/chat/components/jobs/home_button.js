var request = require('request-promise');
var co = require('co');
module.exports = function(agenda) {
  agenda.define('append home', function(job, done) {
    let message = JSON.parse(job.attrs.data.msg);
    let hasHome = checkForHome(message);
    if (!hasHome) {
      co(function * () {
        message.attachments.push({
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
        yield request({
          uri: `https://slack.com/api/chat.update?token=${job.attrs.data.token}&ts=${message.ts}&channel=${job.attrs.data.channel}&as_user=true&attachments=${stringify(message.attachments)}&text=${message.text}`
        });
        done();
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
  let stringOrig = JSON.stringify(text);
  stringOrig = stringOrig.replace(/[\u007F-\uFFFF]/g, function(chr) {
    return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
  });
  return stringOrig;
}
