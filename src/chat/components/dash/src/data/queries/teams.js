import Slackbot from '../models/Slackbot';
import SlackbotType from '../types/SlackbotType';
import {
  GraphQLObjectType as ObjectType,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';
import Conn from '../sequelize';
const SlackbotListType = new ListType(SlackbotType);
import {resolver, defaultArgs} from 'graphql-sequelize';

const teams = {  
  type: SlackbotListType,
  args: defaultArgs(Slackbot),
  resolve: resolver(Slackbot)
}

export default teams;
