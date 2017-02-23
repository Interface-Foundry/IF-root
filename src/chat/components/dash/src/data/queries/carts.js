import CartType from '../types/CartType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';
import Cart from '../models/Cart';
const CartListType = new ListType(CartType);
import {resolver} from 'graphql-sequelize';

const carts = {  
  type: CartListType,
  args: {
    
     id: { 
        type: StringType
      },

      slack_id: { 
        type: StringType
       },

       items: { 
        type: StringType
       },

       purchased: { 
        type: StringType
       },

       deleted: { 
        type: StringType
       },

       created_date: {
          type: StringType
        },

       purchased_date: {
          type: StringType
        },

        type: {
          type: StringType
        },

        link: {
          type: StringType
        },
  },
  resolve: resolver(Cart)
  // resolve (root, args) {
  //  return Conn.models.cart.findAll({ limit: 1000, order: [['created_date', 'DESC']]})
  // }
}

export default carts;


