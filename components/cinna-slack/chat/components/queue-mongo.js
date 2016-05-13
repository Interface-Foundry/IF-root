var kip = require('kip');
var co = require('co');
var PubSub = require('db').PubSub;
var rx = require('rx');


var topics = {'messages': 1, 'nlp': 2, 'picstitch': 3};

//
// publishes a message in the given topic. returns a promise
//
function publish(topic, data) {
  if (typeof topic !== 'string') {
    throw new Error('pub/sub topic must be a string, ex queue.publish("messages", {})')
  }

  topic = topic.toLowerCase();
  if (!topics[topic]) {
    throw new Error(`pub/sub topic "${topic}" does not exist`);
  }

  if (!data) {
    throw new Error('cannot publish null message')
  }

  // Upsert the thing
  return co(function*() {
    yield PubSub.update({
      _id: getKey(topic, data)
    }, {
      _id: getKey(topic, data),
      topic: topic,
      data: data
    }, {
      upsert: true
    }).exec();

    // now alert the subscribers if there are any
    // TODO
  })
}

function getKey(topic, data) {
  if (topic === 'messages') {
    return data.user + '.' + data.channel + '.' + data.timestamp;
  }

  throw new Error("getKey not implemented for " + topic)
}

//
// returns an RXJS observer for a topic
//
function topic(topic) {
  kip.debug('subscribing to topic:', topic);

  if (typeof topic !== 'string') {
    throw new Error('pub/sub topic must be a string, ex queue.publish("messages", {})')
  }

  topic = topic.toLowerCase();

  if (!topics[topic]) {
    throw new Error(`pub/sub topic "${topic}" does not exist`);
  }

  return rx.Observable.create(observer => {
    // Main polling interval goes through all unread messages
    setInterval(() => {
      co(function*() {
        while (true) {
          var message = yield getNextMessage(topic);
          if (!message) { return }
          kip.debug('dispatching message', message);
          observer.onNext(message);
        }
      }).catch(kip.err)
    }, 1000);

    // Retry interval, retry if dispatched but not done and 10 seconds old.
    setInterval(() => {
      console.log('retry');
      PubSub.update({
        dispatched: true,
        done: { $ne: true },
        dispatch_time: { $lt: new Date() - 10000 },
        retries: { $lt: 3 }
      }, {
        $set: { dispatched: false },
        $inc: { retries: 1 }
      }, {
        multi: true
      }).exec();
    }, 5000)
  })
}

function* getNextMessage(topic) {
  var message = yield PubSub.findOne({
    topic: topic,
    dispatched: { $ne: true },
    done: { $ne: true },
    $or: [
      {retries: {$exists: false}},
      {retries: {$lt: 3}}
    ]
  }).exec();

  if (!message) { return }

  var status = yield PubSub.update({
    _id: message._id,
    dispatched: { $ne: true }
  }, {
    $set: {
      dispatched: true,
      dispatch_time: new Date()
    }
  }).exec();

  if (status.ok !== 1) {
    return getNextMessage(topic);
  } else {
    return message;
  }
}


// testing
if (!module.parent) {
  require('colors');
  topic('messages').subscribe(m => {
    console.log(m.data.text);
    m.ack();
  })

  var i = 0;
  setInterval(() => {
    console.log('publishing a message...')
    i++;
    var message = {
      user: 'peter',
      channel: 'kip',
      timestamp: i,
      text: "Hi i'm message " + i
    };

    publish('messages', message).catch(kip.err)
  }, 2000)
}


module.exports.publish = publish;
module.exports.topic = topic;
