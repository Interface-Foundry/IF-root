import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql'; 
import Conn from '../sequelize';
import WaypointType from '../types/WaypointType';
import Waypoint from '../models/Waypoint';

const WaypointListType = new ListType(WaypointType);
import {resolver} from 'graphql-sequelize';

const waypoints = {  
  type: WaypointListType,
  args: {

    id: { 
        type: StringType
      },

    delivery_id: { 
        type: StringType
       },

    user_id: { 
        type: StringType
       },

    waypoint: { 
        type: StringType
      },

    data: { 
        type: StringType
      },

    timestamp: {
        type: StringType
      },
  },
  resolve: resolver(Waypoint)
  // resolve (root, args) {
  //  return Conn.models.cart.findAll({ limit: 1000, order: [['created_date', 'DESC']]})
  // }
}

export default waypoints;
