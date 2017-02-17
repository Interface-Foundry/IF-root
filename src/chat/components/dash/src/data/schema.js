import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import teams from './queries/teams';
import users from './queries/users';
import deliveries from './queries/deliveries';
import carts from './queries/carts';
import items from './queries/items';
import metrics from './queries/metrics';
import messages from './queries/messages';
import me from './queries/me';

const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      teams,
      users,
      deliveries,
      carts,
      items,
      messages,
      metrics,
      me
    },
  }),
});

export default schema;
