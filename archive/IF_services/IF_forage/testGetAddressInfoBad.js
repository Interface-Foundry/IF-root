var getAddressInfo = require('./getAddressInfo');

getAddressInfo('7 For All Mankind New York').then(function(a) {
    console.log(JSON.stringify(a));
});