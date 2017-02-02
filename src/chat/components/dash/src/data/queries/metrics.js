import Metrics from '../models/mongo/metric_schema';
import MetricType from '../types/MetricType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const MetricListType = new ListType(MetricType);

// console.log('wtf is metrics ', Metrics)
const metricsList = {  
  type: MetricListType,
  resolve: () => {
   return new Promise((resolve, reject) => {
      Metrics.find({ "metric": "shopping.link.click"}, (err, metrics) => {
        console.log('firing resolve fuck 3')
        if (err) {
          console.log('wtf err: ', err)
          reject(err) }
        else {
          console.log('found metrics!')
          metrics = metrics.slice(0,2);
          resolve({metrics})
        } 
      })
    })
  }
}

export default metricsList;
