var mongoose = require('mongoose');

// stores any sort of metrics
var proxySchema = mongoose.Schema({
    proxy: String,
    request_url: String,
    delay_ms: Number,
    success: Boolean,
    ts: {
      type: Date,
      default: Date.now
    },
    source: {},
    error_message: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Proxy', proxySchema);

module.exports.log = function(proxy, delay_ms, success) {
  var obj = {
    proxy: proxy,
    delay_ms: delay_ms,
    success: success
  };
  (new module.exports(obj)).save();
}
