import DeliveryType from '../types/DeliveryType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLBoolean as BooleanType
} from 'graphql';
import Conn from '../sequelize';

const DeliveryListType = new ListType(DeliveryType);

const deliveries = {  
  type: DeliveryListType,
  args: {
        id: { 
        type: StringType
      },

      active: {
        type:  StringType,
      },

      session_id: {
        type: StringType
      },

      team_id: {
        type: StringType
      },

      onboarding: {
        type:  StringType
      },

      chosen_restaurant: {
        type: StringType
      },

      budget: {
        type: StringType
      },

      user_budgets: {
        type: StringType
      },

      menu: {
        type: StringType
      },

      chosen_channel: {
        type: StringType
      },

      fulfillment_method: {
        type: StringType
      },

      instructions: {
        type: StringType
      },

      time_started: {
        type: StringType
      },

      mode: {
        type: StringType
      },

      action: {
        type: StringType
      },

      data: {
        type: StringType
      },

      delivery_post: {
        type: StringType
      },

      order: {
        type: StringType
      },

      tip: {
        type: StringType
      },

      service_fee: {
        type: StringType
      },

      coupon: {
        type: StringType
      },

      main_amount: {
        type: StringType
      },

      calculated_amount: {
        type: StringType
      },

      discount_amount: {
        type: StringType
      },

      payment_post: {
        type: StringType
      },

      payment: {
        type: StringType
      },

      guest_token: {
        type: StringType
      },

      completed_payment: {
        type:  BooleanType
      },

      delivery_error: {
        type: StringType
      },
  },
  resolve (root, args) {
   return Conn.models.delivery.findAll({ where: args })
   // limit: 1000, order: [['time_started', 'DESC']]
  }
}

export default deliveries;