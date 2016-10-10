var EventEmitter = require('events')
var co = require('co')
var request = require('request-promise')
require('logging')
require('colors')

var team = require('./test_team_1')

// reset the team
co(team.reset).catch(console.error.bind(console))

function run_chat_server () {
  console.log('running mock slack server')
  return new Promise((resolve, reject) => {
    var express = require('express')
    var app = express()
    var bodyParser = require('body-parser')
    app.use(bodyParser.json())

    /**
     * Listen for mock taps
     */
    app.post('/tap/:access_token', (req, res) => {
      // register listeners
      ALL_THE_WEB_CLIENTS[req.params.access_token].on_next((message) => {
        res.send(message)
      })
      ALL_THE_RTM_CLIENTS[req.params.access_token].on_next((message) => {
        res.send(message)
      })

      var body = {payload: JSON.stringify(req.body) }
      // send the mock tap
      request({
        method: 'POST',
        uri: 'http://localhost:8000/slackaction',
        body: body,
        json: true
      })
    })

    /**
     * Listen for mock texts
     */
    app.post('/text/:access_token', (req, res) => {
      // register listeners
      ALL_THE_WEB_CLIENTS[req.params.access_token].on_next((message) => {
        res.send(message)
      })
      ALL_THE_RTM_CLIENTS[req.params.access_token].on_next((message) => {
        res.send(message)
      })

      // send the mock message
      ALL_THE_RTM_CLIENTS[req.params.access_token].on_message(req.body)
    })

    /**
     * URL for mock delayed action responses
     */
    app.post('action_response/:team_id/:message_id', (req, res) => {
      console.log('not implemented yet')
    })
    app.listen(8080, function (e) {
      if (e) {
        reject(e)
      }
      console.log('mock slack chat server listening on port 8080, ' + randomThing())
      resolve()
    })
  })
}

function randomThing () {
  var things = ["ma'am", 'sir', 'dude', 'man', 'bro', 'dad', 'bitch', 'commander', 'Sir!', 'captain', 'lieutenant', 'i guess', 'probably...']
  return things[Math.random(things.length) | 0]
}

var ALL_THE_RTM_CLIENTS = {}
var ALL_THE_WEB_CLIENTS = {}

/**
 *
 *
 * @param {any} access_token
 */
function RtmClient (access_token) {
  console.log('registering mock RtmClient', access_token)
  this.access_token = access_token
  var me = this
  this.on_next = function (callback) {
    me.next_callback = callback
  }
  ALL_THE_RTM_CLIENTS[access_token] = this
}

RtmClient.prototype.start = function () {}
RtmClient.prototype.sendMessage = function (text, channel, callback) {
  // in this function we'll make sure the message is the appropriate format
  if (typeof this.next_callback === 'function') {
    this.next_callback({
      text: text
    })
  }
}
RtmClient.prototype.on = function (ev, fn) {
  if (ev === 'message') {
    // this is the function that we'll hijack to implement the
    // mock messages from the user
    this.on_message = fn
  }
}

/**
 *
 *
 * @param {any} access_token
 */
function WebClient (access_token) {
  console.log('registering mock WebClient', access_token)
  this.access_token = access_token
  ALL_THE_WEB_CLIENTS[access_token] = this
  var next_callback
  this.on_next = function (callback) {
    next_callback = callback
  }
  function postMessage (channel, text, message) {
    // pass the message to the test framework here
    if (typeof next_callback === 'function') {
      next_callback(message)
    }
  }
  return {
    chat: {
      postMessage: postMessage
    }
  }
}

module.exports = {
  run_chat_server: run_chat_server,
  RtmClient: RtmClient,
  WebClient: WebClient,
  RTM_EVENTS: {
    MESSAGE: 'message'
  },
  CLIENT_EVENTS: {
    RTM: {
      AUTHENTICATED: 'authenticated'
    },
    DISCONNECT: 'disconnect'
  }
}
