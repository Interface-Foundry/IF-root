import Item from '../models/Item';
import ItemType from '../types/ItemType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';
import {resolver, defaultArgs} from 'graphql-sequelize';
const ItemListType = new ListType(ItemType);

const items = {  
  type: ItemListType,
  args: defaultArgs(Item),
  resolve: resolver(Item)
}

export default items;