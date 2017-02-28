import Message from '../models/Message';
import MessageType from '../types/MessageType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';
import {resolver, defaultArgs} from 'graphql-sequelize';

const MessageListType = new ListType(MessageType);

const messages = {  
  type: MessageListType,
  args: defaultArgs(Message),
  resolve (root, args) {
   return Conn.models.message.findAll({ limit: 10000, order: [['ts', 'DESC']]})
  }
}

export default messages;

