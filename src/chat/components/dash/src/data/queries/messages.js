import MessageType from '../types/MessageType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const MessageListType = new ListType(MessageType);

const messages = {  
  type: MessageListType,
  args: {
     id: { 
        type: StringType
      },
      thread_id: { 
        type: StringType
       },
       origin: { 
        type: StringType
       },
       mode: { 
        type: StringType
       },
       action: { 
        type: StringType
       },
       team: { 
        type: StringType
       },
       channel: { 
        type: StringType
       },
       user: { 
        type: StringType
       },
       user_id: { 
        type: StringType
       },
       cart_reference_id: { 
        type: StringType
       },
       incoming: { 
        type: StringType
       },
       original_text: { 
        type: StringType
       },
       text: { 
        type: StringType
       },
       original_query: { 
        type: StringType
       },
       url_shorten: { 
        type: StringType
       },
       amazon: { 
        type: StringType
       },
       ts: {
        type: StringType
       },
       source_ts: { 
        type: StringType
       },
       slack_ts: { 
        type: StringType
       },
       replace_ts: { 
        type: StringType
       },
       action_ts: { 
        type: StringType
       }
  },
  resolve (root, args) {
   return Conn.models.message.findAll({ limit: 10000, order: [['ts', 'DESC']]})
  }
}

export default messages;

