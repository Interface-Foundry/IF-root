import { Meteor } from 'meteor/meteor';
import { Metrics } from '../imports/api/metrics.js';

Meteor.startup(() => {
	Meteor.publish('metrics',function(){
	  return Metrics.find({'metric':'cart.link.click'});
	});
  // code to run on server at startup
});
