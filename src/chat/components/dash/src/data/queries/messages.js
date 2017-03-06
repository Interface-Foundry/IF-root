import Message from '../models/Message';
import MessageType from '../types/MessageType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLInt
} from 'graphql';
import Conn from '../sequelize';
import {
  resolver,
  defaultArgs,
  defaultListArgs
} from 'graphql-sequelize';

const MessageListType = new ListType(MessageType);

const messages = {
  type: MessageListType,
  args: {
    limit: {
      type: GraphQLInt
    },
    order: {
      type: StringType
    },
    team: {
      type: StringType
    },
    incoming: {
      type: StringType
    },
    user: {
      type: StringType
    }
  },
  resolve: resolver(Message)
}

export default messages;