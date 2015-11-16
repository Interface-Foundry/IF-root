/**
 * Logger logs to ELK in production, nothing elsewhere
 * @type {*|exports|module.exports}
 */
var config = require('config');
var traceback = require('traceback');
var os = require('os');
var hostname = os.hostname();
var filename = require.main ? require.main.filename.split('/').pop() : 'debug';

if (config.elasticsearchElk) {
  console.log('logging data to elasticsearch "logstash-node/' + filename + '"');
  console.log('on server', config.elasticsearchElk.url)
  var es = require('elasticsearch').Client({
      host: config.elasticsearchElk.url
  });
} else {
  console.log('not logging to elasticsearch')
}

var getStackInfo = function() {
  // todo fix this shit, it broke in different versions of node.
    var stack = traceback();

    var s = stack[2];
    return {
        line: s.line,
        file: s.path,
        fn_name: s.name || s.method
    };
};

function createLogObject(data) {
    if (data === null) {
        data = {};
    }

    if (typeof data !== 'object' || data instanceof Array) {
        data = {
            message: data
        };
    }

    data["@timestamp"] = (new Date()).toISOString();
    data["@version"] = "1";
    data.host = hostname;

    return data;
}

//
// Main logger. Pass literally anything here.
//
module.exports.log = function(data) {
    data = createLogObject(data);
    // only log to elasticsearch if we can
    if (config.elasticsearchElk) {
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

//
// Main error logger.  adds @error = true to the logged object
//
module.exports.error = function(data) {
  data = createLogObject(data);
  data['@error'] = true;
  module.exports.log(data);
}

// Happy fun times express stuff
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
