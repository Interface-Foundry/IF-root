import MetricType from '../types/MetricType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const MetricListType = new ListType(MetricType);

const metrics = {  
  type: MetricListType,
  args: {
    metric: {
      type: StringType 
    },
    data: {
      type: StringType
    },
    timestamp: {
        type: StringType
       }
  },
  resolve (root, args) {
   return Conn.models.metric.findAll({ limit: 1000, order: [['timestamp', 'DESC']]})
  }
}

export default metrics;


