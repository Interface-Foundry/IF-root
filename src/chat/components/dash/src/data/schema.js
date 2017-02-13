import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

import metrics from './queries/metrics';
import messages from './queries/messages';
import carts from './queries/carts';
import me from './queries/me';
import deliveries from './queries/deliveries';


const schema = new Schema({
  query: new ObjectType({
    name: 'Query',
    fields: {
      messages,
      metrics,
      carts,
      deliveries,
      me,
    },
  }),
});

export default schema;
