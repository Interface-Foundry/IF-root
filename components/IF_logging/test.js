var logger = require('./if_logger');

var f = function() {
    logger.log('sup');
};

f();


setTimeout(function() {
    logger.log('time OUT!');
}, 100);


logger.log({wow: 12, msg: 'very 12'});

logger.log();