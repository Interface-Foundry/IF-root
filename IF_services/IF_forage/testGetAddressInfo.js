var getAddressInfo = require('./getAddressInfo');

getAddressInfo('770 Broadway New York New York').then(function(a) {
    console.log(a);
});