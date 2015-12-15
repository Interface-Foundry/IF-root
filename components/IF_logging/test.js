var Log = require('./if_logger');
log = Log('api_server');
log('something cool');
log({
  config: '12345'
})
log.error('hit an error');


var log2 = Log('shopify')
log2('coolis majoris')
log2([1, 2, 3, 4])
log2({
  user: 'zach with a k'
})

var f = function() {
    log('sup');
};

f();
