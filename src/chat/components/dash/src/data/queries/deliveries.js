import Delivery from '../models/Delivery';
import DeliveryType from '../types/DeliveryType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType
} from 'graphql';
import Conn from '../sequelize';
import {resolver, defaultArgs} from 'graphql-sequelize';

const DeliveryListType = new ListType(DeliveryType);

const deliveries = {  
  type: DeliveryListType,
  args: defaultArgs(Delivery),
  resolve: resolver(Delivery)
}

export default deliveries;