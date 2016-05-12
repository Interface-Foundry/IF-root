var kip = require('kip');
var gcloud = require('gcloud');
var rx = require('rx');

var pubsub = gcloud.pubsub({
  projectId: 'kip-styles',
  keyFilename: __dirname + '/Kip Styles-f933938f52bb.json'
});

var topics = ['messages', 'nlp', 'picstitch'].reduce((topics, topic) => {
  var name = process.env.NODE_ENV === 'production' ? topic : topic + '-test';
  topics[topic] = pubsub.topic(name);
  return topics;
}, {})


//
// publishes a message in the given topic. returns a promise
//
function publish(topic, message) {
  if (!topics[topic] || !topics[topic].publish) {
    throw new Error(`pub/sub topic "${topic}" does not exist`);
  }

  if (!message) {
    throw new Error('cannot publish null message')
  }

  return new Promise((resolve, reject) => {
    topics[topic].publish({data: message}, e => {
      if (e) return reject(e);
      resolve();
    })
  })
}

//
// returns an RXJS observer for a topic
//
function subscribe(topic) {
  kip.debug('subscribing to topic:', topic);
  if (!topics[topic] || !topics[topic].publish) {
    throw new Error(`pub/sub topic "${topic}" does not exist`);
  }

  var name = process.env.NODE_ENV === 'production' ? topic : topic + '-test';

  return rx.Observable.create(observer => {
    var options = {
      ackDeadlineSeconds: 100,
      interval: 1000, // interval in milliseconds to check for new messages
      maxInProgress: 10, // Maximum messages to consume simultaneously
      reuseExisting: true, // If the subscription already exists, reuse it.
    }
    topics[topic].subscribe(name, options, (err, sub) => {
      if (err) throw new Error(err);
      // pass the message from google pub/sub to the rxjs observable
      sub.on('message', m => {
        observer.onNext(m);
      });

      sub.on('error', kip.err);
    })
  })
}

// testing
if (!module.parent) {
  require('colors');
  subscribe('messages').subscribe(m => {
    console.log(m.data.cyan);
    m.ack(kip.err);
  })

  var i = 0;
  setInterval(() => {
    console.log('publishing a message...')
    publish('messages', 'hello i am a message ' + (i++)).catch(kip.err)
  }, 5000)
}


module.exports.publish = publish;
module.exports.subscribe = subscribe;
