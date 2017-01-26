var co = require('co')
var sleep = require('co-sleep')
var rx = require('rx')
var hostname = require('os').hostname()
var slack = require('./slack/slack')
var _ = require('lodash')

var topics = {
  'incoming': 1,
  'nlp': 2,
  'picstitch': 3,
  'outgoing.slack': 4,
  'outgoing.kik': 5,
  'outgoing.telegram': 6,
  'outgoing.facebook': 7,
  'outgoing.web': 8,
  'outgoing.skype': 9,
  'variation.facebook': 10,
  'variation.slack': 11,
  // 'cafe.payment': 12
}

//
// publishes a message in the given topic. returns a promise
//
function publish (topic, data, key) {
  logging.info('topic: ', topic, 'data: ', data, 'key: ', key)
  if (typeof topic !== 'string') {
    throw new Error('pub/sub topic must be a string, ex queue.publish("messages", {})')
  }

  topic = topic.toLowerCase();
  if (!topics[topic]) {
    throw new Error(`pub/sub topic "${topic}" does not exist`)
  }

  if (!data) {
    throw new Error('cannot publish null message')
  }

  // catch all slack messages and direcly send them
  if (topic === 'outgoing.slack') {
    // kill me why why why do i have to do this
    if (_.get(data, 'reply.data')) {
      slack.send({ data: data }) // wat
    } else if (data.text || data.attachments) {
      slack.send({ data: data })
    } else {
      slack.send(data)
    }
  }

  // Upsert the thing
  return co(function * () {
    return yield db.Pubsub.update({
        _id: key
      }, {
        _id: key,
        topic: topic,
        data: data,
        publisher: hostname
      }, {
        upsert: true
      }).exec()

  // now alert the subscribers if there are any
  // TODO
  })
}

//
// returns an RXJS observer for a topic
//
function topic (topic) {
  kip.debug('subscribing to topic:', topic)

  if (typeof topic !== 'string') {
    throw new Error('pub/sub topic must be a string, ex queue.publish("messages", {})')
  }

  topic = topic.toLowerCase()

  if (!topics[topic]) {
    throw new Error(`pub/sub topic "${topic}" does not exist`)
  }

  return rx.Observable.create(observer => {
    // Main polling loop goes through all unread messages
    co(function * () {
      while (true) {
        var message = yield getNextMessage(topic)
        if (!message) {
          yield sleep(500)
        } else {
          kip.debug('handling message', message._id)
          observer.onNext(message)
        }
      }
    }).catch(kip.err)

    // Retry interval, retry if dispatched but not done and 10 seconds old.
    // setInterval(() => {
    //   db.Pubsub.update({
    //     dispatched: true,
    //     done: { $ne: true },
    //     dispatch_time: { $lt: new Date() - 10000 },
    //     $or: [
    //       {retries: {$exists: false}},
    //       {retries: {$lt: 3}}
    //     ]
    //   }, {
    //     $set: { dispatched: false },
    //     $inc: { retries: 1 }
    //   }, {
    //     multi: true
    //   }).exec()
    // }, 10000)
  })
}

function* getNextMessage(topic) {
  var message = yield db.Pubsub.findOne({
    topic: topic,
    dispatched: { $ne: true },
    done: { $ne: true }
  }).exec()

  if (!message) { return }

  var status = yield db.Pubsub.update({
    _id: message._id,
    dispatched: { $ne: true }
  }, {
    $set: {
      dispatched: true,
      dispatch_time: new Date(),
      consumer: hostname
    }
  }).exec()

  if (status.ok !== 1) {
    return getNextMessage(topic)
  } else {
    message.dispatched = true
    return message
  }
}

//              T       S
// testing        E   T
//                  S
if (!module.parent) {
  require('colors')
  topic('messages').subscribe(m => {
    console.log('ack-ing message'.green, m.data.text)
    m.ack()
  })

  var i = 0
  setInterval(() => {
    console.log('publishing a message...')
    i++
    var message = {
      user: 'peter',
      channel: 'kip',
      timestamp: i,
      text: "Hi i'm message " + i
    }

    publish('messages', message, message.user + '.' + message.timestamp).catch(kip.err)
  }, 2000)
}

module.exports.publish = publish
module.exports.topic = topic
