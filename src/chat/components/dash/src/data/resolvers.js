/**
 * @file Defines the resolvers for the different schemas being used.
 */


import { ObjectId } from 'mongodb';
import GraphQLToolsTypes from "graphql-tools-types"

import {
  Carts,
  Chatusers,
  Deliveries,
  Items,
  Messages,
  Metrics,
  Slackbots,
  Waypoints,
} from '../database';

/**
 * Setting a limit to the number of results per page to 1000
 *
 * @param coll - a collection from the database
 * @param args - query arguments 
 * @param sort - sort option for results
 */
async function pagination(coll, args, sort) {
  let limit = args.limit || 1000;
  delete args.limit;

  let skip = args.offset || 0;
  delete args.offset;

  let id = args._id;
  if (args._id) args._id = ObjectId(args._id);

  // TODO(Cameron): I'm assuming coll.find() is synchronous, and it's toArray()
  // that is asychronous?
  let q = coll.find(args);
  if (sort) q = q.sort(sort);
  return await q.skip(skip).limit(limit).toArray();
}

const resolvers = {

  // Business objects

  Cart: {
    items: async ({_id}) => {
      return (await Items.find({ cart_id: _id }).sort({added_date: -1}).toArray());
    },
  },

  Chatuser: {
    team: async ({team_id}) => {
      return (await Slackbots.findOne({ team_id: team_id }));
    },
  },

  Delivery: {
    team: async ({team_id}) => {
      return (await Slackbots.findOne({team_id: team_id}));
    }
  },

  Item: {
    cart: async ({cart_id}) => {
      return (await Carts.findOne(ObjectId(cart_id)));
    }
  },

  Slackbot: {
    members: async ({team_id}) => {
      return (await Chatusers.find({ team_id: team_id }).toArray());
    },
    carts: async ({team_id}) => {
      return (await Carts.find({ slack_id: team_id }).toArray());
    },
  },

  Waypoint: {
    delivery: async ({delivery_id}) => {
      return (await Deliveries.findOne(ObjectId(delivery_id)));
    },
  },

  // Custom types

  JSON: GraphQLToolsTypes.JSON({ name: "Custom JSON scalar type" }),
  Date: GraphQLToolsTypes.Date({ name: "Custom Date scalar type" }),

  // Root query

  Query: {
    carts: async (root, args) => {
      return await pagination(Carts, args);
    },

    deliveries: async (root, args) => {
      return await pagination(Deliveries, args);
    },

    items: async (root, args) => {
      return await pagination(Items, args);
    },

    messages: async (root, args) => {
      return await pagination(Messages, args);
    },

    metrics: async (root, args) => {
      return await pagination(Metrics, args);
    },

    teams: async (root, args) => {
      return await pagination(Slackbots, args);
    },

    users: async (root, args) => {
      return await pagination(Chatusers, args);
    },

    waypoints: async (root, args) => {
      return await pagination(Waypoints, args);
    },

  },

};


export default resolvers;
