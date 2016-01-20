var db = require('db')
var kip = require('kip')
var fs = require('fs')
console.log('running message stats')

db.messages.find({bucket: 'search', action: 'initial', incoming: true})
  .select('tokens')
  .exec(function(err, messages) {
    kip.fatal(err);
    console.log(messages.length);
    console.log(messages.map(function(m) {
      return m.tokens[0];
    }))
    fs.writeFileSync('./kipSearchTerms.txt', messages.map(function (m) {
      return m.tokens[0];
    }).join('\n'));
  })
