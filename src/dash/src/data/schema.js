/**
 * @file - defines the schemas, their attributes, and the attribute types
 */

import { makeExecutableSchema } from 'graphql-tools';

import { Resolvers } from './resolvers';
import typeDefinition from './type_definitions';

const executableSchema = makeExecutableSchema({
  typeDefs: [typeDefinition],
  resolvers: Resolvers,
});

export default executableSchema;
