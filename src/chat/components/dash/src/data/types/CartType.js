import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType,
  GraphQLInt as IntType
} from 'graphql';
import JSONType from './JSONType';
import ItemType from './ItemType';
import SlackbotType from './SlackbotType';
import Cart from '../models/Cart';
import {resolver} from 'graphql-sequelize';


const CartType = new ObjectType({
  name: 'Cart',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(cart) {
          return cart.id
        }
      },
      slack_id: { 
        type: StringType,
        resolve(cart) {
          return cart.slack_id
        }
       },
       items: { 
        type: StringType,
        resolve(cart) {
          return cart.items
        }
       },
       purchased: { 
        type: StringType,
        resolve(cart) {
          return cart.purchased
        }
       },
       deleted: { 
        type: StringType,
        resolve(cart) {
          return cart.deleted
        }
       },
       created_date: {
          type: StringType,
          resolve(cart) {
           return cart.created_date
          }
        },
       purchased_date: {
          type: StringType,
          resolve(cart) {
           return cart.purchased_date
          }
        },

        type: {
          type: StringType,
          resolve(cart) {
           return cart.type
          }
        },
        link: {
          type: StringType,
          resolve(cart) {
           return cart.link
          }
        },
        amazon: {
          type: JSONType,
          resolve(cart) {
           return cart.amazon
          }
        },
        team: {
          type: SlackbotType,
          resolve: resolver(Cart.Team)
        },
        full_items: {
          type: new ListType(ItemType),
          args: {
            limit: {
              type: IntType
            },
            offset: {
              type: IntType
            },
            order: {
              type: StringType
            },
            first: {
              type: IntType
            }
          }, resolve: resolver(Cart.Items, {
            before: function (options, args) {
              if (args.first) {
                options.order = options.order || [];
                options.order.push(['added_date', 'DESC']);
                if (args.first !== 0) {
                  options.limit = args.first;
                }
              }
              return options;
            }
        })
       },
    }
  },
});

export default CartType;