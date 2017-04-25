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
    title: '',
    text: '🔑 Administrative Professionals\' Day is observed yearly. \n It\'s on Wednesday, April 26th and recognizes those on your team that juggle titles such as office manager/executive assistant/coffee marker/receptionist and conference room booker. \nStart showing your appreciation! Tap `Find Out Now` below to see *What Kind Of Team Do I Have?*',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '',
    'fallback': 'A1',
    'callback_id': 'Q1',
    'attachment_type': 'default',
    'color':'#52A2F0',
    'actions': [{
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
    title: '',
    text: 'Which weird office thing do you secretly love?',
    attachments: []
  }

  msg_json.attachments.push({
    'text': 'asdfasdf',
    'fallback': 'A1',
    'callback_id': 'Q1',
    'attachment_type': 'default',
    'color':'#52A2F0',
    'image_url':'https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_2.png',
    'actions': [{
      'name': 'quiz_bloomthat.q2',
      'text': '📊 Bar charts',
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
    'color':'#52A2F0',
    'image_url':'https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_3.png',
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
    'color':'#52A2F0',
    'image_url':'https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_4.png',
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
    'color':'#52A2F0',
    'image_url':'https://storage.googleapis.com/kip-random/bloomthat_quiz/quiz_5.png',
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
  var resultSentence
  var resultType 

  quizAnswers.map(function(a) {

    if(a.answer || a.answer == 0 && Number.isInteger(a.answer)){
      result = result + a.answer
    }else {
      console.log('not a real # ',a.answer)
    }
  })

  console.log('%%%%%%% \n',result)

 // result = _.sortBy(result, 'count')

  if(result >= 0 && result <= 4){
      resultSentence = 'a DILIGENT'
      resultType = 'diligent'
  }else if(result >= 5 && result <= 7){
      resultSentence = 'a CREATIVE'
      resultType = 'creative'
  }else if(result >= 8 && result <= 10){
      resultSentence = 'an AMBITIOUS'
      resultType = 'ambitious'
  }else if(result >= 11 && result <= 13){
      resultSentence = 'a FUTURISTIC'
      resultType = 'futuristic'
  }else if(result >= 14 && result <= 16){
      resultSentence = 'a CONFIDENT'
      resultType = 'confident'
  }else {
      resultSentence = 'an AMBITIOUS'
      resultType = 'ambitious'    
  }

  var resultItem = {
    'diligent':{
      url:'https://www.bloomthat.com/flowers/the-dozen-get-better',
      item:'🍪 DOZEN GET BETTER',
      descrip:'Not as showy as others, your team is methodical and precise. Work is a strategy game for long-term wins. Some may accuse you of being slow or secretive, but you know that patience and great implementation builds lasting empires'
    },
    'creative':{
      url:'https://www.bloomthat.com/flowers/the-bloom-break',
      item:'💐 BLOOM BREAK',
      descrip:'Colorful, unique and wildly imaginative, your team is full of ideas. Work is a process of perfecting craft. Sometimes it can get a lil’ messy, but that’s just small stuff when you’re busy building dreams'
    },
    'ambitious':{
      url:'https://www.bloomthat.com/flowers/the-action-items',
      item:'🚀 ACTION ITEMS',
      descrip:'Fueled by coffee and competition, your team is full of driven workaholics. Work is a desire to change the world, and challenge destiny. Sometimes it can get a lil’ too intense, but that’s small stuff when you’re changing the world'
    },
    'futuristic':{
      url:'https://www.bloomthat.com/flowers/the-walter',
      item:'🌱 THE WALTER',
      descrip:'Artificial Intelligence? VR? Blockchain? It might be buzzwords to some, but not you. Your team is on the cutting edge of  technology, with deep research roots and serious smarts. Work is a challenge into the unknown. Sometimes it can seem impossible, but that’s small stuff when you’re at the frontier of future technology'
    },
    'confident':{
      url:'https://www.bloomthat.com/flowers/the-savory-sampler',
      item:'🍴 SAVORY SAMPLER',
      descrip:'Well-rounded with strong experience and all-star team players, that’s you. Work is an exciting place where you can achieve your goals. Sometimes being at the top can feel a lil’ lonely, but that’s small stuff when you’re out there seizing opportunities'
    }
  }

  console.log('URL RESULT ',resultItem[resultType].url)

  var msg_json = {
    title: '',
    text: 'You’re *'+resultSentence+'* team \n'+resultItem[resultType].descrip+'\nRecommended Item: <'+resultItem[resultType].descrip+ ' | '+ resultItem[resultType].url +'>',
    attachments: []
  }

  msg_json.attachments.push({
    'text': '< ► Click To View | ' + resultItem[resultType].url + '>',
    'fallback': 'A1',
    'callback_id': 'score',
    'attachment_type': 'default',
    'color':'#f60',
    'author_name': "BloomThat",
    'author_link': resultItem[resultType].url,
    'author_icon': "https://storage.googleapis.com/kip-random/bloomthat_quiz/bloomthat_social_media.png",
    'actions': [{
      'name': 'quiz_bloomthat.restart',
      'text': 'Restart Quiz',
      'type': 'button',
      'value': 'A1'
    },{
      'name': 'quiz_bloomthat.exit',
      'text': 'Exit',
      'type': 'button',
      'value': 'A2'
    }]
  })
  $replyChannel.sendReplace(message, 'quiz_bloomthat.score', {type: message.origin, data: msg_json})
}



handlers['quiz_bloomthat.restart'] = function * (message) {

  //get quiz answers
  var quizAnswers = yield db.Quiz.find({user_id: message.source.user, team_id: message.source.team, active: true}).exec()

  console.log('QUIZ ANSAWERSSSDSDSDSDS ',quizAnswers)
  console.log('QUIZ ANSAWERSSSDSDSDSDS lenth ',quizAnswers.length)
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
