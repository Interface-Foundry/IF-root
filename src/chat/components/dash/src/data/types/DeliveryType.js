import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType
} from 'graphql';

const DeliveryType = new ObjectType({
  name: 'Delivery',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(delivery) {
          return delivery.id
        }
      },

      active: {
        type:  StringType,
        resolve(delivery) {
          return delivery.active
        }
      },

      session_id: {
        type: StringType,
        resolve(delivery) {
          return delivery.session_id
        }
      },

      team_id: {
        type: StringType,
        resolve(delivery) {
          return delivery.team_id
        }
      },

      onboarding: {
        type:  StringType,
        resolve(delivery) {
          return delivery.onboarding
        }
      },

      chosen_restaurant: {
        type: StringType,
        resolve(delivery) {
          return delivery.chosen_restaurant
        }
      },

      budget: {
        type: StringType,
        resolve(delivery) {
          return delivery.budget
        }
      },

      user_budgets: {
        type: StringType,
        resolve(delivery) {
          return delivery.budget
        }
      },

      menu: {
        type: StringType,
        resolve(delivery) {
          return delivery.menu
        }
      },

      chosen_channel: {
        type: StringType,
        resolve(delivery) {
          return delivery.chosen_channel
        }
      },

      fulfillment_method: {
        type: StringType,
        resolve(delivery) {
          return delivery.fulfillment_method
        }
      },

      instructions: {
        type: StringType,
        resolve(delivery) {
          return delivery.instructions
        }
      },

      time_started: {
        type: StringType,
        resolve(delivery) {
          return delivery.time_started
        }
      },

      mode: {
        type: StringType,
        resolve(delivery) {
          return delivery.mode
        }
      },

      action: {
        type: StringType,
        resolve(delivery) {
          return delivery.action
        }
      },

      data: {
        type: StringType,
        resolve(delivery) {
          return delivery.data
        }
      },

      delivery_post: {
        type: StringType,
        resolve(delivery) {
          return delivery.delivery_post
        }
      },

      order: {
        type: StringType,
        resolve(delivery) {
          return delivery.order
        }
      },

      tip: {
        type: StringType,
        resolve(delivery) {
          return delivery.tip
        }
      },

      service_fee: {
        type: StringType,
        resolve(delivery) {
          return delivery.service_fee
        }
      },

      coupon: {
        type: StringType,
        resolve(delivery) {
          return delivery.coupon
        }
      },

      main_amount: {
        type: StringType,
        resolve(delivery) {
          return delivery.main_amount
        }
      },

      calculated_amount: {
        type: StringType,
        resolve(delivery) {
          return delivery.calculated_amount
        }
      },

      discount_amount: {
        type: StringType,
        resolve(delivery) {
          return delivery.discount_amount
        }
      },

      payment_post: {
        type: StringType,
        resolve(delivery) {
          return delivery.payment_post
        }
      },

      payment: {
        type: StringType,
        resolve(delivery) {
          return delivery.payment
        }
      },

      guest_token: {
        type: StringType,
        resolve(delivery) {
          return delivery.guest_token
        }
      },

      completed_payment: {
        type:  StringType,
        resolve(delivery) {
          return delivery.completed_payment
        }
      },

      delivery_error: {
        type: StringType,
        resolve(delivery) {
          return delivery.delivery_error
        }
      },
    }
  },
});

export default DeliveryType;