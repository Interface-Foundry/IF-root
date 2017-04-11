var request = require('request-promise');

module.exports = function(agenda) {
  // agenda.define('append home', function(job, done) {
  //   let message = JSON.parse(job.attrs.data.msg);
  //   let hasHome = checkForHome(message);
  //   let attachments = message.attachments ? message.attachments : [];
  //   if (!hasHome) {
  //     attachments = attachments.map(a => {
  //       a.text = a.text ? a.text : '';
  //       return a;
  //     });
  //     attachments.push({
  //       text: '',
  //       callback_id: 'appendedHome',
  //       actions: [{
  //         name: 'passthrough',
  //         text: 'Home',
  //         style: 'default',
  //         type: 'button',
  //         value: 'home'
  //       }]
  //     });
  //     request.post({
  //         url: 'https://slack.com/api/chat.update',
  //         json: true,
  //         form: {
  //           token: job.attrs.data.token,
  //           ts: message.ts,
  //           channel: job.attrs.data.channel,
  //           as_user: true,
  //           attachments: stringify(attachments),
  //           text: message.text
  //         }
  //       })
  //       .then(() => kip.debug('♻️  Tried to add home button, if it isn\'t there it\'s a slack problem'))
  //       .catch(() => kip.debug('😡 Couldn\'t add home, problem on our end'))
  //       .then(() => done());
  //   } else {
  //     done();
  //   }
  // });
};

function checkForHome(message) {
  let isHome = false;
  message.attachments.forEach(a => {
    if (a.actions && !isHome) {
      a.actions.forEach(b => {
        if (b.text === 'Home' || b.text === '< Home' || (a.text && a.text.includes('Kip Store'))) {
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