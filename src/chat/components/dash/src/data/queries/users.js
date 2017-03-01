import Chatuser from '../models/Chatuser';
import ChatuserType from '../types/ChatuserType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';

const ChatuserListType = new ListType(ChatuserType);
import {resolver, defaultArgs} from 'graphql-sequelize';

const users = {  
  type: ChatuserListType,
  args: defaultArgs(Chatuser),
  resolve: resolver(Chatuser)

}

export default users;