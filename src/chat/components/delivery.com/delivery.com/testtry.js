var co = require('co')
require('kip');

co(function*() {
  if (yield kip.icanhazinternet()) {
    console.log('wow such internet');
  } else {
    console.log('too bad')
  }
}).catch(kip.err)
