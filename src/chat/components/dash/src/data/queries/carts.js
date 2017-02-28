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
import {resolver, defaultArgs} from 'graphql-sequelize';

const carts = {  
  type: CartListType,
  args: defaultArgs(Cart),
  resolve: resolver(Cart)
}

export default carts;


