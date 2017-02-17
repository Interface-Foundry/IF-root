import ItemType from '../types/ItemType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const ItemListType = new ListType(ItemType);

const items = {  
  type: ItemListType,
  args: {
      id: { 
        type: StringType
      },

      cart_id: {
        type:  StringType
      },

      title: {
        type: StringType
      },

      image: {
        type: StringType
      },

      description: {
        type:  StringType
      },

      price: {
        type: StringType
      },

      ASIN: {
        type: StringType
      },

      rating: {
        type: StringType
      },

      review_count: {
        type: StringType
      },

      added_by: {
        type: StringType
      },

      slack_id: {
        type: StringType
      },

      source_json: {
        type: StringType
      },

      purchased: {
        type: StringType
      },

      purchased_date: {
        type: StringType
      },

      deleted: {
        type: StringType
      },

      added_date: {
        type: StringType
      },

      bundle: {
        type: StringType
      },

      available: {
        type: StringType
      },

      asins: {
        type: StringType
      },

      config: {
        type: StringType
      }
  },
  resolve (root, args) {
   return Conn.models.item.findAll({ limit: 10000, order: [['added_date', 'DESC']]})
  }
}

export default items;