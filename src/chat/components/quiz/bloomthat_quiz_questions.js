'use strict'
var _ = require('lodash')
var stable = require('stable')
var striptags = require('striptags')

var config = require('../../../config')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
/**@namespace*/
var handlers = {}


//bloom that help

handlers['quiz_bloomthat.help_print'] = function * (message) {

  var msg_json = {
    title: '^ ^ ^ ^ ^ ',
    text: 'INFORMATION ABOUT ADMIN DAY',
    attachments: []
  }

  msg_json.attachments.push({
    'text': 'info info info',
    'fallback': 'A1',
    'callback_id': 'Q1',
    'attachment_type': 'default',
    'actions': [{
      color: '#45a5f4',
      name: 'quiz_bloomthat',
      value: 'quiz_bloomthat',
      text: '👀 Find Out Now',
      style: 'primary',
      type: 'button'
    },{
      'name': 'quiz_bloomthat.exit',
      'text': 'Home',
      'type': 'button',
      'value': 'A2'
    }]
  })

  $replyChannel.sendReplace(message, 'quiz_bloomthat.begin', {type: message.origin, data: msg_json})
}

//BLOOM THAT QUIZ
handlers['quiz_bloomthat.q1'] = function * (message) {

  var msg_json = {
    title: '^ ^ ^ ^ ^ ',
    text: 'Which weird office thing do you secretly love?',
    attachments: []
  }

  msg_json.attachments.push({
    'text': 'asdfasdf',
    'fallback': 'A1',
    'callback_id': 'Q1',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q2',
      'text': '📊 Bar chart',
      'type': 'button',
      'value': 0 
    },{
      'name': 'quiz_bloomthat.q2',
      'text': '📎 Paperclip',
      'type': 'button',
      'value': 2
    },{
      'name': 'quiz_bloomthat.q2',
      'text': '✂️ Scissors',
      'type': 'button',
      'value': 3
    },{
      'name': 'quiz_bloomthat.q2',
      'text': '📈 Hockey Stick',
      'type': 'button',
      'value': 4
    }]
  })

  $replyChannel.sendReplace(message, 'quiz_bloomthat.q2', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q2'] = function * (message) {

  var msg_json = {
    title: 'asdjfla;ksdf',
    text: 'How many browser tabs do you have open?',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'Q2',
    'callback_id': 'Q2',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q3',
      'text': '1',
      'type': 'button',
      'value': 0
    },{
      'name': 'quiz_bloomthat.q3',
      'text': '3',
      'type': 'button',
      'value': 1
    },{
      'name': 'quiz_bloomthat.q3',
      'text': '5',
      'type': 'button',
      'value': 2
    },{
      'name': 'quiz_bloomthat.q3',
      'text': '8+',
      'type': 'button',
      'value': 3
    },{
      'name': 'quiz_bloomthat.q3',
      'text': '😱 don’t ask',
      'type': 'button',
      'value': 4
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.q3', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q3'] = function * (message) {

  var msg_json = {
    title: '',
    text: 'Which is your dream city?',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'A1',
    'callback_id': 'Q3',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q4',
      'text': '🇫🇷 Paris',
      'type': 'button',
      'value': 0
    },{
      'name': 'quiz_bloomthat.q4',
      'text': '⛩️ Tokyo',
      'type': 'button',
      'value': 1
    },{
      'name': 'quiz_bloomthat.q4',
      'text': '🗽 New York',
      'type': 'button',
      'value': 4
    },{
      'name': 'quiz_bloomthat.q4',
      'text': '🇬🇧 London',
      'type': 'button',
      'value': 2
    },{
      'name': 'quiz_bloomthat.q4',
      'text': '🌉 San Francisco',
      'type': 'button',
      'value': 4
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.q4', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q4'] = function * (message) {

  var msg_json = {
    title: '',
    text: 'Finish this line: “I’ll love a _________ right now”',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'A1',
    'callback_id': 'Q4',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.score',
      'text': '🍷 glass of wine',
      'type': 'button',
      'value': 4
    },{
      'name': 'quiz_bloomthat.score',
      'text': '☕  cup of coffee',
      'type': 'button',
      'value': 2
    },{
      'name': 'quiz_bloomthat.score',
      'text': '🍵 cup of tea',
      'type': 'button',
      'value': 0
    },{
      'name': 'quiz_bloomthat.score',
      'text': '🍺 pint of beer',
      'type': 'button',
      'value': 3
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.score', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.score'] = function * (message) {

  
  var quizAnswers = yield db.Quiz.find({user_id: message.source.user, team_id: message.source.team, active: true}).exec()

  var result = 0

  quizAnswers.map(function(a) {
    if(a.answer && Number.isInteger(a.answer)){
      result = result + a.answer
    }else {
      console.log('not a real # ',a.answer)
    }
  })

  console.log('%%%%%%% \n',result)

 // result = _.sortBy(result, 'count')

  var msg_json = {
    title: '',
    text: 'Your winning quiz answer is: '+result+'!!!!!!',
    attachments: []
  }

  msg_json.attachments.push({
    'text': 'wow such score shop bloom that. also, FREE MUG!!',
    'fallback': 'A1',
    'callback_id': 'score',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.restart',
      'text': 'Restart Quiz',
      'type': 'button',
      'value': 'A1'
    },{
      'name': 'quiz_bloomthat.exit',
      'text': 'Home',
      'type': 'button',
      'value': 'A2'
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.score', {type: message.origin, data: msg_json})
}



handlers['quiz_bloomthat.restart'] = function * (message) {

  //get quiz answers
  var quizAnswers = yield db.Quiz.find({user_id: message.source.user, team_id: message.source.team, active: true}).exec()

  if (quizAnswers){
    //reset latest answers so quiz starts fresh
    quizAnswers.map(function(a) {
      a.active = false
      a.save()
    })
  }
  //restart quiz
  yield handlers['quiz_bloomthat.q1'](message, true)
}



module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
