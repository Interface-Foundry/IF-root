var md5 = require('md5');

var functions = {};

module.exports = function(f) {
    var ctx = this;
    var hash = md5(f.toString());
    if (!functions[hash]) {
        functions[hash] = {};
    }

    return function() {
        var arghash = md5(JSON.stringify(arguments));
        if (arghash in functions[hash]) {
            return functions[hash][arghash];
        } else {
            var v = f.apply(ctx, arguments);
            functions[hash][arghash] = v;
            return v;
        }
    }
};