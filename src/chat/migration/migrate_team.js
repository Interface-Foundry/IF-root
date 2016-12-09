/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\/*\
# Migrate Team

the idea is to grab the team from jolteon and then move it over to google cloud.

```
node migrate_team Mars Vacation Condos
```

or use in module

```js
var migrateTeam = require('./migrate_team')
var team = ... get team somehow
migrateTeam(team).then(...)
```
\*/


// process the input, which should be a team name or something
var co = require('co')
var _ = require('lodash')
var prompt = require('prompt-promise')

// command line usage
if (!module.parent) {
  co(function * () {
    var name = process.argv.slice(2).join(' ')
    var team = yield findTeam(name)
    if (!team) {
      console.log('could not find team "' + name + '"')
      process.exit(1)
    }

    console.log('found team "' + team.team_name + '"')
    yield prompt('Enter to continue, or ctrl+c to quit')
    var newTeam = yield migrate(team)
    console.log('team is in new database. _id is', newTeam._id.toString())
    console.log('deactivating old team by setting slackbot.meta.migrated to "true"')
    yield deactivateOldTeam(team)
    console.log('to fully deactivate the old team, you need to restart the slack process on chat.kipapp.co')
    process.exit(0)
  }).catch(console.error.bind(console))
}

function * findTeam(name) {
  var mongodb = require('mongodb')
  var old_db = yield mongodb.MongoClient.connect('mongodb://jolteon.kipapp.co/foundry')
  var team = yield old_db.collection('slackbots').findOne({team_name: name})
  return team
}

function * deactivateOldTeam(team) {
  var mongodb = require('mongodb')
  var old_db = yield mongodb.MongoClient.connect('mongodb://jolteon.kipapp.co/foundry')
  var r = yield old_db.collection('slackbots').update({team_name: team.team_name}, {$set: {'meta.migrated': true}})
  console.log(r.result)
}


function * migrate(team) {
  var kip = require('../../kip')
  var doc = _.merge({}, team, {

  })
  var team = new db.Slackbot(doc)
  yield team.save()
  return team
}

module.exports = {
  migrate: migrate
}
