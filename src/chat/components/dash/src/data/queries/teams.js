import SlackbotType from '../types/SlackbotType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const SlackbotListType = new ListType(SlackbotType);

const teams = {  
  type: SlackbotListType,

  args: {
    
     id: { 
        type: StringType
      },

      team_id: {
        type:  StringType
      },


      access_token: {
        type:  StringType
      },

      scope: {
        type:  StringType
      },

      team_name: {
        type:  StringType
      },

      incoming_webhook_url: {
        type:  StringType
      },

      incoming_webhook_channel: {
        type:  StringType
      },

      bot_user_id: {
        type: StringType
      },

      bot_access_token: {
        type: StringType
      },

      dateAdded: {
        type: StringType
      },

      addedBy: {
        type: StringType
      },

      initialized: {
        type: StringType
      },

      // office_assistants: {
      //   type: DataType.ARRAY(DataType.STRING(255))
      // },

      status_interval: {
        type: StringType
      },

      weekly_status_enabled: {
        type: StringType
      },

      weekly_status_day: {
        type: StringType
      },


      weekly_status_date: {
        type: StringType
      },

      weekly_status_time: {
        type: StringType
      },

      weekly_status_timezone: {
        type: StringType
      },

      city: {
        type: StringType
      },

      // cart_channels: {
      //   type: DataType.ARRAY(DataType.STRING(255))
      // },

      collect_from: {
        type: StringType
      },

      deleted: {
        type: StringType
      },

      chosen_location: {
        type: StringType
      },

      fulfillment_method: {
        type: StringType
      },

      mock: {
        type:  StringType
      },

      p2p: {
        type:  StringType
      },

      used_coupons: {
        type:  StringType
      }
  },
  resolve (root, args) {
   return Conn.models.slackbot.findAll({ limit: 1000, order: [['dateAdded', 'DESC']]})
  }
}

export default teams;
