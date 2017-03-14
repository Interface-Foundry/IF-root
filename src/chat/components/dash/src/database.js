/**
* @file - connecting to mongo and gathering the database collections into variables to be exported
*/

import {MongoClient, ObjectId} from 'mongodb';

const MONGO_URL = 'mongodb://localhost:27017/foundry'

var Carts, Deliveries, Items, Messages, Metrics, Slackbots, Chatusers, Waypoints;

function connect() {
	return new Promise((resolve, reject) => {
		MongoClient.connect(MONGO_URL, function(err, db) {
			if (db == null || err != null) {
				reject(err);
			}
			
			console.log('mongo connected');
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

export { connect, Carts, Deliveries, Items, Messages, Metrics, Slackbots, Chatusers, Waypoints };
