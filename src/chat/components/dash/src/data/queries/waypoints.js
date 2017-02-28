import Waypoint from '../models/Waypoint';
import WaypointType from '../types/WaypointType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql'; 
import Conn from '../sequelize';
const WaypointListType = new ListType(WaypointType);
import {resolver, defaultArgs} from 'graphql-sequelize';

const waypoints = {  
  type: WaypointListType,
  args: defaultArgs(Waypoint),
  resolve: resolver(Waypoint)
  // resolve (root, args) {
  //  return Conn.models.cart.findAll({ limit: 1000, order: [['created_date', 'DESC']]})
  // }
}

export default waypoints;
