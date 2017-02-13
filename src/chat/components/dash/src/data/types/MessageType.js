
import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType
} from 'graphql';

const MessageType = new ObjectType({
  name: 'Message',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(message) {
          return message.id
        }
      },
      thread_id: { 
        type: StringType,
        resolve(message) {
          return message.thread_id
        }
       },
       origin: { 
        type: StringType,
        resolve(message) {
          return message.origin
        }
       },
       mode: { 
        type: StringType,
        resolve(message) {
          return message.mode
        }
       },
       action: { 
        type: StringType,
        resolve(message) {
          return message.action
        }
       },
       team: { 
        type: StringType,
        resolve(message) {
          return message.team
        }
       },
       channel: { 
        type: StringType,
        resolve(message) {
          return message.channel
        }
       },
       user: { 
        type: StringType,
        resolve(message) {
          return message.user
        }
       },
       user_id: { 
        type: StringType,
        resolve(message) {
          return message.user_id
        }
       },
       cart_reference_id: { 
        type: StringType,
        resolve(message) {
          return message.cart_reference_id
        }
       },
       incoming: { 
        type: StringType,
        resolve(message) {
          return message.incoming
        }
       },
       original_text: { 
        type: StringType,
        resolve(message) {
          return message.original_text
        }
       },
       text: { 
        type: StringType,
        resolve(message) {
          return message.text
        }
       },
       original_query: { 
        type: StringType,
        resolve(message) {
          return message.original_query
        }
       },
       // url_shorten: { 
       //  type: ListType,
       //  resolve(message) {
       //    return message.url_shorten
       //  }
       // },
       amazon: { 
        type: StringType,
        resolve(message) {
          return message.amazon
        }
       },
       ts: {
	    type: StringType,
	    resolve(message) {
	       return message.ts
	    }
	   },
	   source_ts: { 
        type: StringType,
        resolve(message) {
          return message.source_ts
        }
       },
       slack_ts: { 
        type: StringType,
        resolve(message) {
          return message.slack_ts
        }
       },
       replace_ts: { 
        type: StringType,
        resolve(message) {
          return message.replace_ts
        }
       },
       action_ts: { 
        type: StringType,
        resolve(message) {
          return message.action_ts
        }
       }
    }
  },
});

export default MessageType;