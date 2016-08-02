var kip = require('kip');

var timer = kip.timer();
timer();
setInterval(() => {
  timer('interval');
}, 1000)
