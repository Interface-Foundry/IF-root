var Metric = db.Metric;
var MetricType = require('./MetricType')
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const QueryType = new ObjectType({  
  name: 'Query',
  fields: () => ({
    todos: {
      type: new ListType(MetricType),
      resolve: () => {
        return new Promise((resolve, reject) => {
          Metric.find((err, metrics) => {
            if (err) reject(err)
            else resolve(metrics)
          })
        })
      }
    }
  })
})

export default QueryType;
