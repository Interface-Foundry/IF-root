import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType
} from 'graphql';

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
    }
  },
});

export default CartType;