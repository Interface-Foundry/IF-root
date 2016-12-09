//Kip Finder 

var _ = require('lodash')
var co = require('co')
var request = require('co-request')
var async = require('async')

var find = require('./find_help.js')

// * * GET IDS * * //
// -- production
var ids = find.ids
// -- testing
//var ids = shout.testIds
// * * * * //

//go through the ids
async.mapSeries(ids, function(token,callback){

	co(function *() {

		request.post({
		  url:     'https://slack.com/api/team.info',
		  form:    { token: token }
		}, function(error, response, body){
		  
		  var z = JSON.parse(body)

		  if (z.team && z.team.domain){
		  	console.log('. ',z.team.domain)
		  	if (z.team.domain == 'topbotsteam' || z.team.domain == 'trashpins'){
		  		console.log('& & & & & & & & & & & & & & & & & & &&  & &&  & && &  & found it! ',z.team)
		  	}
		  }
		})


	  	//done with user, move on to next user
		setTimeout(function () {
		  callback()
		}, 500) //slow reqs for rate limits

	}).catch(function(err) {
	  console.error(err.stack);
	});

}, function(err, results) {
      //bleh
      console.log('ok we shouted 🦃 🦃 🦃 ... now back to hibernating 🐧 🐧 🐧')
});

