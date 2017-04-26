require('../../../kip')
var co = require('co')
var request = require('co-request')
var sleep = require('co-sleep')
var slack = require('@slack/client')
const fs = require('fs')
var series = require('co-series')

/**
 * File used to scrape emails from all deleted and non-deleted members of Slack teams
 * @module slack/feature_rollout
 */



//
// Run it
//
function * main () {

  console.log('/ / / / / / / / / / / scraping teams')

  var teams = yield db.Slackbots.find({}).exec()

  yield teams.map(series(function * (t) { 

    yield scrapeTeam(t.team_name)

  }))

  process.exit(0)
}

//dissect team 🙃
function * scrapeTeam (team_name) {

  yield sleep (500)
  console.log('FIRING TEAM ',team_name)

  //get team obj from team name
  var team = yield db.Slackbots.findOne({team_name: team_name}).exec()

  if(!team){
    console.log('* * no team found in DB, return')
    return 
  }

  //check if we're still authorized with team
  let teamStatus = yield request("https://slack.com/api/auth.test?token="+team.bot.bot_access_token)
  var p = JSON.parse(teamStatus.body) 

  if(p && p.ok){

    console.log('// BOT AUTHORIZED -_-')
    //so dumb lalalalalalaal
    let userList = yield request("https://slack.com/api/users.list?token="+team.bot.bot_access_token)
    let users = JSON.parse(userList.body)
    users = users.members

    /// / / / / / / / / / / / / / / 
    yield saveToScraper(users,p.team) //store for later ;) fuck off slack
    console.log('👻 scraped team ',p.team)
    /// / / / / / / / / / / / / / / 

  }else {
    console.log('// BOT NOT AUTHORIZED //')
    return
  }
}

//fuck slack; bye 
function * saveToScraper(users,team_name){
    console.log('scraping users')
    yield users.map(series(function * (u) { 
      if(u.id && u.team_id && u.id !== 'USLACKBOT'){
        var email
        if(u.profile && u.profile.email){
          email = u.profile.email
        }else {
          return
        }
        var a = new db.Scraper({
          user_id: u.id,
          team_id: u.team_id,
          email: email,
          team_name: team_name,
          real_name: u.real_name,
          name: u.name,
          deleted: u.deleted,
        })
        return a.save()
      }
    }))
}


co(main).catch(e => {
  console.error(e)
  process.exit(1)
})
