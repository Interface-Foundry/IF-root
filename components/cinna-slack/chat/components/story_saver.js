var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');
var shortid = require('shortid');

var survey = require( __dirname + '/stories/survey_templates/survey1.js')


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

    	//POST questions
    	yield createQuestions(questions) 

    	//POST question links
    	yield createLinks(questions)
        
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
// var loadIds = function*(questions){
// 	//map questions
// 	questions = questions.map(function(q) {
// 	  var qObj = q
// 	  //map answers in questions
// 	  var answers = q.answers.map(function(a) {
// 	  	var aObj = a
// 	  	aObj.id = 'A'+shortid.generate() //generate answer id 
// 	  	return aObj
// 	  })
// 	  q.answers = answers
// 	  return qObj
// 	});
// 	return questions
// }


/**
 * This function POSTs new questions to external Neomodel service
 * @param {Object} questions to post 
 */
var createQuestions = function*(questions){
	//post questions to service
	console.log('OK')
	//loop through question array, async eachseries
	return questions

}

/**
 * This function creates new answer links questions to Neomodel graph DB
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var createLinks = function*(questions){
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
			answer_id: a.id,
			target_q_id: a.target_q_id
		}	  	
		links.push(newLink)
	  	return
	  })
	  return
	});

	console.log(links)

	return 
}


saveStory()


