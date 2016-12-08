var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/', secret: 'lnrL3Cfq4xnbW6S7' })
require('../kip')
var _ = require('lodash')


var PORT = process.env.NODE_ENV === 'production' ? 7777 : 8000
if (process.env.NODE_ENV === 'canary') PORT = 7777
var branch = process.env.NODE_ENV === 'production' ? 'refs/heads/master' : 'refs/heads/dev'
var channel = process.env.NODE_ENV === 'production' ? 'G06BTTZGW' : 'D1GGV0CMU'
if (process.env.NODE_ENV === 'canary') channel = 'G06BTTZGW'
var Professor = require('../monitoring/prof_oak').Professor
var prof = new Professor(channel)
var deploy = require('./deploy')

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(PORT)

handler.on('error', function (err) {
  logging.error('Error:', err.message)
})

handler.on('push', function (event) {
  logging.info('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)
  logging.info(event)

  if (event.payload.ref !== branch) {
    return logging.info(`not a push to ${branch}, will not do anything`)
  }

  // var author = _.get(event, 'payload.head_commit.author.name') || _.get(event, 'payload.head_commit.committer.name', 'Anonymous')
  var message = _.get(event, 'payload.head_commit.message', '[no commit message]')
  // var timestamp = _.get(event, 'payload.head_commit.timestamp', '[no commit timestamp]')

  deploy('HEAD').then(() => {
    var successChat = `Deployed to ${process.env.NODE_ENV} - "${message}"`
    prof.say(successChat)
  }).catch((e) => {
    var errorChat = `Error deploying to ${process.env.NODE_ENV}- "${message}"\n${e}`
    prof.say(errorChat)
  })


})

handler.on('issues', function (event) {
  logging.info('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})

logging.info('listening for incoming git webhooks on lucky port number ' + PORT.toString().green)
