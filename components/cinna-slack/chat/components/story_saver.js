var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');
var shortid = require('shortid');
var rp = require('request-promise');

var survey = require( __dirname + '/stories/survey_templates/survey1.js')

var urlBase = 'http://192.168.1.7:5000/'


/**
 * This function loads and saves questions to Neomodel graph DB
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var saveStory = function(){

    co(function* () {

    	//get questions from JSON file
    	var questions = yield loadQuestions()

    	//get answer IDs
    	//questions = yield loadIds(questions)

    	//console.log('ZZZ ',JSON.stringify(questions,undefined,2))

    	//POST questions
    	yield createQuestions(questions) 

    	var split = yield splitLinks(questions)

    	//POST question links
    	yield createBranches(split.branch)

    	yield createDirectLinks(split.direct)
        
    }).catch(function(err){
        console.error('co err ',err);
    });
}


var loadQuestions = function*(){

	var questions = []
  	
	//loop all questions
    Object.keys(survey.survey1).forEach(function(key,index) {

        //construct obj for neomodel
        var newQuestion = {
        	id: key,
        	survey_id: 'survey-1',
        	prompt: survey.survey1[key].prompt,
        	answers: survey.survey1[key].answers,
        	skippable: false
        }
        questions.push(newQuestion)
    });
    return questions
}


// //* * * NOTE: this needs to removed from the loader and stored directly in survey
var loadIds = function*(questions){

	console.log('INCOMING load IDs ',questions)

	var counter = 0
	//map questions
	questions = questions.map(function(q) {
	  var qObj = q
	  //map answers in questions
	  var answers = q.answers.map(function(a) {
	  	counter++
	  	var aObj = a
	  	aObj.value = aObj.label.trim().toLowerCase() //temp value from label
	  	aObj.id = 'A'+counter //generate answer id 
	  	return aObj
	  })
	  q.answers = answers
	  return qObj
	});
	return questions
}


/**
 * This function POSTs new questions to external Neomodel service
 * @param {Object} questions to post 
 */
var createQuestions = function*(questions){
	//post questions to service

	async.mapSeries(questions, function(q, cb) {

		var options = {
		    method: 'POST',
		    uri: urlBase + '/question',
		    body: q,
		    json: true // Automatically stringifies the body to JSON 
		};
		 
		rp(options)
	    .then(function (parsedBody) {
	        // POST succeeded... 
	        cb()
	    })
	    .catch(function (err) {
	        // POST failed... 
	        console.log('post err: ',err)
	    });

		// request({

		// }, function(){
		// 	setTimeout(function() {
		// 		cb()
		// 	}, 10);
		// })

	}, function(err) {

		console.log('ERR ',err)
		console.log('RES ',res)
		return

	})

	//loop through question array, async eachseries
}

/**
 * This function creates new answer links questions to Neomodel graph DB
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var splitLinks = function*(questions){
	//post links to service

	//link schema:
	// { 
	// 	source_q_id: x, 
	// 	answer_id: y, 
	// 	target_q_id: z
	// }

	var links = []

	//map questions
	questions.map(function(q) {
	  //var qObj = q
	  //map answers in questions
	  q.answers.map(function(a) {
		var newLink = {
			source_q_id: q.id,
			answer_value: a.label.trim().toLowerCase().replace(/ /g,"_"),
			target_q_id: a.target_q_id
		}	  	
		links.push(newLink)
	  	return
	  })
	  return
	});

	var split = links.uniqueBy(function(o) { 
	    return o.source_q_id + "~~~" + o.target_q_id + "***" + o.answer_value;
	});

	return split
}

/**
 * This function creates new answer links questions to Neomodel graph DB
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var createBranches = function*(l){

	console.log('BRANCHES ',l)
	//post links to service

	// var links = []

	// //map questions
	// questions.map(function(q) {
	//   //var qObj = q
	//   //map answers in questions
	//   q.answers.map(function(a) {
	// 	var newLink = {
	// 		source_q_id: q.id,
	// 		answer_id: a.id,
	// 		target_q_id: a.target_q_id
	// 	}	  	
	// 	links.push(newLink)
	//   	return
	//   })
	//   return
	// });

	//console.log(links)

	return 
}

/**
 * This function creates new answer links questions to Neomodel graph DB
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var createDirectLinks = function*(l){

	console.log('DIRECTS ',l)

	// var links = []

	// //map questions
	// questions.map(function(q) {
	//   //var qObj = q
	//   //map answers in questions
	//   q.answers.map(function(a) {
	// 	var newLink = {
	// 		source_q_id: q.id,
	// 		target_q_id: a.target_q_id
	// 	}	  	
	// 	links.push(newLink)
	//   	return
	//   })
	//   return
	// });



	//console.log('-----____-- ',links)

	return 
}


Array.prototype.uniqueBy = function(keyBuilder) {

	var dLinks = []
	var bLinks = []
	var count = {}
    var seen = {}

    var filtered = this.filter(function(o) {

      var key = keyBuilder(o)

      var z = key.split('***')
      key = z[0]
      var val = z[1]


      //already seen
      if(seen[key]){
      	count[key].num++
      }
      //new
      else {
      	count[key] = {
      		num:1,
      		value: val
      	}
      }
      return (seen[key] = true);
    });

	//loop all questions
    Object.keys(count).forEach(function(k,i) {
        //console.log('i ',i)
        if(count[k].num > 1 && dLinks.indexOf(k) <= -1){
        	dLinks.push(k)
        }else {
        	bLinks.push({
        		value: count[k].value,
        		key: k
        	})
        }
    });

    //build direct links
    var dFin = dLinks.map(function(l){
    	var a = l.split('~~~')
    	var obj = {
    		source_q_id: a[0],
    		target_q_id: a[1]
    	}
    	return obj
    })

    //build branch links
    var bFin = bLinks.map(function(l){
    	var a = l.key.split('~~~')
    	var obj = {
    		source_q_id: a[0],
    		answer_value: l.value,
    		target_q_id: a[1]
    	}
    	return obj
    })
    
	return {	
		direct:dFin,
		branch:bFin
	}
}


saveStory() //load stories to DB


module.exports.loadIds = loadIds


