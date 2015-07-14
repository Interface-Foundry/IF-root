/**
 * Logger logs to ELK in production, nothing elsewhere
 * @type {*|exports|module.exports}
 */
var config = require('config');
var traceback = require('traceback');
var os = require('os');
var hostname = os.hostname();
var filename = require.main.filename.split('/').pop();
console.log('logging data to elasticsearch "logstash-node/' + filename + '"');

var getStackInfo = function() {
    var stack = traceback();

    var s = stack[2];
    return {
        line: s.line,
        file: s.path,
        fn_name: s.name || s.method
    };
};

module.exports.log = function(data) {
    if (data === null) {
        data = {};
    }

    if (typeof data !== 'object' || data instanceof Array) {
        data = {
            message: data
        };
    }

    data["@timestamp"] = new Date();
    data.version = "1";
    data.hostname = hostname;
    data.stack = getStackInfo();

    // only log to elasticsearch if we can
    if (config.elasticsearchElk) {
        var es = require('elasticsearch').Client({
            host: config.elasticsearchElk.url
        });

        es.index({
            index: 'logstash-node',
            type: filename,
            body: data
        }, function(e, r) {
            // who watches the watchers
            if (e) {
                console.error('ERROR LOG AGGREGATOR DOWN - CHECK ELASTICSEARCH ON', config.elasticsearchElk.url);
            }
        });
    }

    // always log to the console
    console.log(data);
};

module.exports.reqProperties = function(req) {
    // never log a password
    if (req.body && req.body.password) {
        req.body.password = '<password hidden>';
    }

    return {
        method: req.method,
        route: req.path,
        body: req.body
    }
};