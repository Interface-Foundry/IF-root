
import {
  GraphQLObjectType as GraphQLObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType
} from 'graphql';

import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

var ObjectType = new GraphQLScalarType({
  name: 'ObjectType',
  serialize: value => {
    return value;
  },
  parseValue: value => {
    return value;
  },
  parseLiteral: ast => {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError("Query error: Can only parse object but got a: " + ast.kind, [ast]);
    }
    return ast.value;
  }
});


const MetricType = new GraphQLObjectType({
  name: 'Metric',
  fields: {
    metric: { type: StringType },
    data: { type: ObjectType },
    ts: { type: StringType }
  },
});

export default MetricType;


// var mongoose = require('mongoose')

// // stores any sort of metrics
// var metricsSchema = mongoose.Schema({
//   // required
//   metric: {
//     type: String,
//     index: true
//   },
//   data: {},

//   // optional
//   userId: String, // optional

//   // automagic
//   timestamp: {
//     type: Date,
//     default: Date.now
//   }
// })

// // create the model for users and expose it to our app
// module.exports = mongoose.model('Metrics', metricsSchema)

// module.exports.log = function (metric, data) {
//   var obj = {
//     metric: metric,
//     data: data
//   };

//   (new module.exports(obj)).save()
// }
