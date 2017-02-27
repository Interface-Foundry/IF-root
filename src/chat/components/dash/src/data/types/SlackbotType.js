import {
  GraphQLIDType as IDType,
  GraphQLObjectType as ObjectType,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
  GraphQLScalarType as GraphQLScalarType,
  GraphQLList as ListType,
  GraphQLInt
} from 'graphql';
import Slackbot from '../models/Slackbot';
import DeliveryType from './DeliveryType';
import ChatuserType from './ChatuserType';
import CartType from './CartType';

import {resolver, defaultListArgs} from 'graphql-sequelize';

const SlackbotType = new ObjectType({
  name: 'Slackbot',
  fields: () => {
    return {
      id: { 
        type: StringType,
        resolve(slackbot) {
          return slackbot.id
        }
      },

      team_id: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.team_id
        }
      },


      access_token: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.access_token
        }
      },

      scope: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.scope
        }
      },

      team_name: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.team_name
        }
      },

      incoming_webhook_url: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.incoming_webhook_url
        }
      },

      incoming_webhook_channel: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.incoming_webhook_channel
        }
      },

      bot_user_id: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.bot_user_id
        }
      },

      bot_access_token: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.bot_access_token
        }
      },

      dateAdded: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.dateAdded
        }
      },

      addedBy: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.addedBy
        }
      },

      initialized: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.initialized
        }
      },

      // office_assistants: {
      //   type: DataType.ARRAY(DataType.STRING(255))
      // },

      status_interval: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.status_interval
        }
      },

      weekly_status_enabled: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.weekly_status_enabled
        }
      },

      weekly_status_day: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.weekly_status_day
        }
      },


      weekly_status_date: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.weekly_status_date
        }
      },

      weekly_status_time: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.weekly_status_time
        }
      },

      weekly_status_timezone: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.weekly_status_timezone
        }
      },

      city: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.city
        }
      },

      // cart_channels: {
      //   type: DataType.ARRAY(DataType.STRING(255))
      // },

      collect_from: {
        type: StringType,
         resolve(slackbot) {
          return slackbot.collect_from
        }
      },

      deleted: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.deleted
        }
      },

      chosen_location: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.chosen_location
        }
      },

      fulfillment_method: {
        type: StringType,
        resolve(slackbot) {
          return slackbot.fulfillment_method
        }
      },

      mock: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.mock
        }
      },

      p2p: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.p2p
        }
      },

      used_coupons: {
        type:  StringType,
        resolve(slackbot) {
          return slackbot.used_coupons
        }
      },

      members: {
        type: new ListType(ChatuserType),
        args: {
          limit: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          },
          order: {
            type: StringType
          },
          first: {
            type: GraphQLInt
          }
      }, resolve: resolver(Slackbot.Members, {
        before: function (options, args) {
          if (args.first) {
            options.order = options.order || [];
            options.order.push(['time_started', 'ASC']);
            if (args.first !== 0) {
              options.limit = args.first;
            }
          }
          return options;
        }
      })
    },

    carts: {
        type: new ListType(CartType),
        args: {
          limit: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          },
          order: {
            type: StringType
          },
          first: {
            type: GraphQLInt
          }
      }, resolve: resolver(Slackbot.Carts, {
        before: function (options, args) {
          if (args.first) {
            options.order = options.order || [];
            options.order.push(['created_date', 'DESC']);
            if (args.first !== 0) {
              options.limit = args.first;
            }
          }
          return options;
        }
      })
    },


    food_sessions: {
        type: new ListType(DeliveryType),
        args: {
          limit: {
            type: GraphQLInt
          },
          offset: {
            type: GraphQLInt
          },
          order: {
            type: StringType
          },
          first: {
            type: GraphQLInt
          }
      }, resolve: resolver(Slackbot.Deliveries, {
        before: function (options, args) {
          if (args.first) {
            options.order = options.order || [];
            options.order.push(['food_sessions', 'DESC']);
            if (args.first !== 0) {
              options.limit = args.first;
            }
          }
          // options.where = options.where || {};
          // options.where.food_sessions = { $not: [] };
         
          return options;
        },
        // after: async function (result) {
        //   return result.filter(function (session) {
        //      return ( session.id && session.time_started ) 
        //   });
        // }
      })
    }
  }
 },
});

export default SlackbotType;