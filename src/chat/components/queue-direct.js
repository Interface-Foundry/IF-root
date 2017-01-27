var co = require('co')
var sleep = require('co-sleep')
var rx = require('rx')
var hostname = require('os').hostname()

var subscribers = []

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
  'messages': 12
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

  // hit the subscribers
  subscribers.filter(s => s.topic === topic).map(s => s.fn(data))

  return Promise.resolve()

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
    subscribers.push({
      topic: topic,
      fn: observer.onNext.bind(observer)
    })
  })
}

//              T       S
// testing        E   T
//                  S
if (!module.parent) {
  require('../../kip')
  require('colors')
  topic('messages').subscribe(m => {
    console.log('ack-ing message'.green, m.text)
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
