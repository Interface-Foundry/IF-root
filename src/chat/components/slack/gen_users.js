require('../../../kip')
var fs = require('fs')
var _ = require('lodash')

db.Slackbots.find({
  'meta.deleted': {$ne: true},
  'meta.mock': {$ne: true}
}).exec(function (e, bots) {
  if (e) {
    console.error(e)
    process.exit(1)
  }

  console.log('found ' + bots.length + ' bots')

  var pages = [1, 2, 10, 20, 40, 100, 200, 300]
  var pagesIndex = 0

  //
  // saves a json array of admin id's which we will ping onthe given day
  //
  function generateDay (day) {
    console.log('Generating batches for day ' + day)
    // get the nth admin of every bot
    var admins = bots
      .map(b => _.get(b, 'meta.office_assistants.' + (day - 1)))
      .filter(Boolean)

    admins = _.uniq(admins)

    var i = 0
    while (admins.length > 0) {
      var n = pages[pagesIndex] || pages[pages.length - 1]
      var batch = admins.splice(-n)

      // write the list of nth admins to a json file for use later
      var filename = `users_batch_${day}${i}.json`
      console.log('writing', filename)
      fs.writeFileSync(filename, JSON.stringify(batch))
      i++
      pagesIndex++
    }
  }

  //
  // generate four days worth of messages
  //
  generateDay(1)
  generateDay(2)
  generateDay(3)
  generateDay(4)
  process.exit(0)
})

