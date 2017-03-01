import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType,
  GraphQLInt
} from 'graphql';
import DateType from './DateType'
import {resolver, defaultListArgs} from 'graphql-sequelize';
import Waypoint from '../models/Waypoint';
import DeliveryType from './DeliveryType';
import ChatuserType from './ChatuserType';

const WaypointType = new ObjectType({
  name: 'Waypoint',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(waypoint) {
          return waypoint.id
        }
      },

      delivery_id: {
        type:  StringType,
        resolve(waypoint) {
          return waypoint.delivery_id
        }
      },

      user_id: {
        type:  StringType,
        resolve(waypoint) {
          return waypoint.user_id
        }
      },

      waypoint: {
        type:  StringType,
        resolve(waypoint) {
          return waypoint.waypoint
        }
      },

      data: {
        type:  StringType,
        resolve(waypoint) {
          return waypoint.data
        }
      },

      timestamp: {
        type:  DateType,
        resolve(waypoint) {
          return waypoint.timestamp
        }
      },

      user: {
        type: ChatuserType,
        resolve: resolver(Waypoint.User)
      },

      food_session: {
        type: DeliveryType,
        args: {}, resolve: resolver(Waypoint.Delivery)
      },



  }
 },
});

export default WaypointType;