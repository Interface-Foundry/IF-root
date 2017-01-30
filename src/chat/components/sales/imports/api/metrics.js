import { Mongo } from 'meteor/mongo';

export const Metrics = new Mongo.Collection('metrics');

// Meteor.subscribe('metrics');
// Metrics.allow({
// 	find: function () {
//       return true;
//     },
//     insert: function () {
//       return true;
//     },
//     update: function () {
//       return true;
//     },
//     remove: function () {
//       return true;
//     }
//   });
