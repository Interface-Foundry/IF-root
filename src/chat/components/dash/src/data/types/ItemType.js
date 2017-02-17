import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType
} from 'graphql';

const ItemType = new ObjectType({
  name: 'Item',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(item) {
          return item.id
        }
      },

      cart_id: {
        type:  StringType,
        resolve(item) {
          return item.cart_id
        }
      },

      title: {
        type: StringType,
        resolve(item) {
          return item.title
        }
      },

      image: {
        type: StringType,
        resolve(item) {
          return item.image
        }
      },

      description: {
        type:  StringType,
        resolve(item) {
          return item.description
        }
      },

      price: {
        type: StringType,
        resolve(item) {
          return item.price
        }
      },

      ASIN: {
        type: StringType,
        resolve(item) {
          return item.ASIN
        }
      },

      rating: {
        type: StringType,
        resolve(item) {
          return item.rating
        }
      },

      review_count: {
        type: StringType,
        resolve(item) {
          return item.review_count
        }
      },

      added_by: {
        type: StringType,
        resolve(item) {
          return item.added_by
        }
      },

      slack_id: {
        type: StringType,
        resolve(item) {
          return item.slack_id        }
      },

      source_json: {
        type: StringType,
        resolve(item) {
          return item.source_json
        }
      },

      purchased: {
        type: StringType,
        resolve(item) {
          return item.purchased
        }
      },

      purchased_date: {
        type: StringType,
        resolve(item) {
          return item.purchased_date
        }
      },

      deleted: {
        type: StringType,
        resolve(item) {
          return item.deleted
        }
      },

      added_date: {
        type: StringType,
        resolve(item) {
          return item.added_date
        }
      },

      bundle: {
        type: StringType,
        resolve(item) {
          return item.bundle
        }
      },

      available: {
        type: StringType,
        resolve(item) {
          return item.available
        }
      },

      asins: {
        type: StringType,
        resolve(item) {
          return item.asins
        }
      },

      config: {
        type: StringType,
        resolve(item) {
          return item.configs
        }
      }

    }
  },
});

export default ItemType;