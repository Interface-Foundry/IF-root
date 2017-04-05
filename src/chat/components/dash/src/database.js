/**
 * @file - connecting to mongo and gathering the database collections into variables to be exported
 */

import {MongoClient, ObjectId} from 'mongodb';

import config from '../../../../config/index';
import logging from '../../../../logging'

var Carts, Deliveries, Items, Messages, Metrics, Slackbots, Chatusers, Waypoints;

function connect() {
  return new Promise((resolve, reject) => {
    logging.debug('connecting to mongo at %s', config.mongodb.url)
    MongoClient.connect(config.mongodb.url, function(err, db) {
      if (db == null || err != null) {
        reject(err);
      }

      logging.debug('connected to mongo');
      Carts = db.collection('carts');
      Deliveries = db.collection('delivery');
      Items = db.collection('items');
      Messages = db.collection('messages');
      Metrics = db.collection('metrics');
      Slackbots = db.collection('slackbots');
      Chatusers = db.collection('chatusers');
      Waypoints = db.collection('waypoints');
      resolve();
    });
  });
}

export { connect, Carts, Deliveries, Items, Messages, Metrics, Slackbots, Chatusers, Waypoints};
