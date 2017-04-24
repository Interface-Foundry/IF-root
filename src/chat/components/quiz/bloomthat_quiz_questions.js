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


//BLOOM THAT QUIZ
handlers['quiz_bloomthat.q1'] = function * (message) {

  var msg_json = {
    title: '^ ^ ^ ^ ^ ',
    text: 'Which would you do??',
    attachments: []
  }

  msg_json.attachments.push({
    'text': 'asdfasdf',
    'fallback': 'A1',
    'callback_id': 'Q1',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q2',
      'text': 'meow',
      'type': 'button',
      'value': 'A1' 
    },{
      'name': 'quiz_bloomthat.q2',
      'text': 'mooo',
      'type': 'button',
      'value': 'A2'
    },{
      'name': 'quiz_bloomthat.q2',
      'text': 'meowweee',
      'type': 'button',
      'value': 'A3'
    }]
  })

  $replyChannel.sendReplace(message, 'quiz_bloomthat.q2', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q2'] = function * (message) {

  var msg_json = {
    title: 'asdjfla;ksdf',
    text: 'hmmmmm?',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'Q2',
    'callback_id': 'Q2',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q3',
      'text': 'zzzzz',
      'type': 'button',
      'value': 'A1'
    },{
      'name': 'quiz_bloomthat.q3',
      'text': 'xzxzxzxzxzx',
      'type': 'button',
      'value': 'A2'
    },{
      'name': 'quiz_bloomthat.q3',
      'text': 'hmmmmm',
      'type': 'button',
      'value': 'A3'
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.q3', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q3'] = function * (message) {

  var msg_json = {
    title: '',
    text: 'ok ok ...',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'A1',
    'callback_id': 'Q3',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.q4',
      'text': 'ahahaha',
      'type': 'button',
      'value': 'A1'
    },{
      'name': 'quiz_bloomthat.q4',
      'text': 'meoowww',
      'type': 'button',
      'value': 'A2'
    },{
      'name': 'quiz_bloomthat.q4',
      'text': 'meoqoqwodwewe',
      'type': 'button',
      'value': 'A3'
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.q4', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.q4'] = function * (message) {

  var msg_json = {
    title: '',
    text: 'umm sure ok whatever',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'A1',
    'callback_id': 'Q4',
    'attachment_type': 'default',
    'actions': [{
      'name': 'quiz_bloomthat.score',
      'text': 'yeah',
      'type': 'button',
      'value': 'A1'
    },{
      'name': 'quiz_bloomthat.score',
      'text': 'nah what',
      'type': 'button',
      'value': 'A2'
    },{
      'name': 'quiz_bloomthat.score',
      'text': 'hehe',
      'type': 'button',
      'value': 'A3'
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.score', {type: message.origin, data: msg_json})
}


handlers['quiz_bloomthat.score'] = function * (message) {

  
  var quizAnswers = yield db.Quiz.find({user_id: message.source.user, team_id: message.source.team, active: true}).exec()

  var result = _(quizAnswers)
  .countBy('answer')
  .map((count, name) => ({ name, count }))
  .value();

  console.log('%%%%%%% \n',result)

  result = _.sortBy(result, 'count')

  var msg_json = {
    title: '',
    text: 'Your winning quiz answer is: '+result[0].name+'!!!!!!',
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
