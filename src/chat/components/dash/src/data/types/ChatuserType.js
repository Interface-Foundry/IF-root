import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType
} from 'graphql';

const ChatuserType = new ObjectType({
  name: 'Chatuser',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(chatuser) {
          return chatuser.id
        }
      },

      user_id: { 
        type: StringType,
        resolve(chatuser) {
          return chatuser.user_id
        }
      },

      platform: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.platform
        }
      },

      onboarded: {
         type: StringType,
         resolve(chatuser) {
          return chatuser.onboarded
        }
      },

      admin_shop_onboarded: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.admin_shop_onboarded
        }
      },

      member_shop_onboarded: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.member_shop_onboarded
        }
      },

      ts: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.ts
        }
      },

      origin: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.origin
        }
      },

      type: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.type
        }
      },

      dm: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.dm
        }
      },

      team_id: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.team_id
        }
      },

      name: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.name
        }
      },

      deleted: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.deleted
        }
      },

      color: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.color
        }
      },

      real_name: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.real_name
        }
      },

      tz: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.tz
        }
      },

      tz_label: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.tz_label
        }
      },

      tz_offset: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.tz_offset
        }
      },

      country: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.country
        }
      },

      is_admin: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_admin
        }
      },

      is_owner: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_owner
        }
      },

      is_primary_owner: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_primary_owner
        }
      },

      is_restricted: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_restricted
        }
      },

      is_ultra_restricted: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_ultra_restricted
        }
      },

      is_bot: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.is_bot
        }
      },

      has_2fa: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.has_2fa
        }
      },

      last_call_alerts: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.last_call_alerts
        }
      },

      emailNotification: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.emailNotification
        }
      },

      awaiting_email_response: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.awaiting_email_response
        }
      },

      phone_number: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.phone_number
        }
      },

      first_name: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.first_name
        }
      },

      last_name: {
        type: StringType,
        resolve(chatuser) {
          return chatuser.last_name
        }
      }
    }
  }
});

export default ChatuserType;
