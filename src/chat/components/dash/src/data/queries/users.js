import ChatuserType from '../types/ChatuserType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const ChatuserListType = new ListType(ChatuserType);

const users = {  
  type: ChatuserListType,
  args: {
      id: { 
        type: StringType
      },

      platform: {
        type: StringType
      },

      onboarded: {
         type: StringType
      },

      admin_shop_onboarded: {
        type: StringType
      },

      member_shop_onboarded: {
        type: StringType
      },

      ts: {
        type: StringType
      },

      origin: {
        type: StringType
      },

      type: {
        type: StringType
      },

      dm: {
        type: StringType
      },

      team_id: {
        type: StringType
      },

      name: {
        type: StringType
      },

      deleted: {
        type: StringType
      },

      color: {
        type: StringType
      },

      real_name: {
        type: StringType
      },

      tz: {
        type: StringType
      },

      tz_label: {
        type: StringType
      },

      tz_offset: {
        type: StringType
      },

      country: {
        type: StringType
      },

      is_admin: {
        type: StringType
      },

      is_owner: {
        type: StringType
      },

      is_primary_owner: {
        type: StringType
      },

      is_restricted: {
        type: StringType
      },

      is_ultra_restricted: {
        type: StringType
      },

      is_bot: {
        type: StringType
      },

      has_2fa: {
        type: StringType
      },

      last_call_alerts: {
        type: StringType
      },

      emailNotification: {
        type: StringType
      },

      awaiting_email_response: {
        type: StringType
      },

      phone_number: {
        type: StringType
      },

      first_name: {
        type: StringType
      },

      last_name: {
        type: StringType
      }, 
  },
  resolve (root, args) {
   return Conn.models.chatuser.findAll({ limit: 10000, order: [['tz', 'DESC']]})
  }
}

export default users;