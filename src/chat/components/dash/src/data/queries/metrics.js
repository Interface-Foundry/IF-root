import MetricType from '../types/MetricType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';


const MetricListType = new ListType(MetricType);

// console.log('wtf is metrics ', Metrics)
const metrics = {  
  type: MetricListType,
  args: {
    metric: {
      type: StringType 
    },
    data: {
      type: StringType
    }
  },
  resolve (root, args) {
   return Conn.models.metric.findAll({where: {
    metric: 'shopping.link.click'
   }})
  }
}

export default metrics;
