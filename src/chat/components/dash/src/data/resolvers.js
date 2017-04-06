/**
 * @file Defines the resolvers for the different schemas being used.
 */

import { ObjectId } from 'mongodb';
import _ from 'lodash';
import GraphQLToolsTypes from "graphql-tools-types"
import DataLoader from 'dataloader';
import { find } from 'lodash';
import co from 'co';

import {
  Carts,
  Chatusers,
  Deliveries,
  Items,
  Messages,
  Metrics,
  Slackbots,
  Waypoints
} from '../database';

// if you want to use db.whatever uncomment this
// import db from "../../../../../db/index.js"

// async function getCafeCartTable(team_id, start_date, end_date) {
//   var sessions = await Delivery.find({id: team_id});
// }

// async function getStoreCartTable(team_id, start_date, end_date) {
//   var sessions = await Carts.find({id: team_id});
// }


import Menu from '../../../delivery.com/Menu';


function prepareCafeCarts(foodSession) {
  foodSession.type = 'slack';

  if (_.get(foodSession, 'menu.menu')) {
    foodSession.chosen_restaurant = foodSession.chosen_restaurant.name
  }

  if (foodSession.cart.length > 0) {
    const menuObj = Menu(foodSession.menu);
    foodSession.cart_total = foodSession.calculated_amount;
    foodSession.item_count = foodSession.cart.length;
    foodSession.items = foodSession.cart.map((i) => {
      const item = menuObj.flattenedMenu[i.item.item_id];
      return {
        item_name: item.name,
        // either need to convert id to name here or with context in the resolver
        user: i.user_id,
      };
    });
  }

  return foodSession;
}


// Data Loaders make it possible to batch load certain queries from mongodb,
// which can drastically reduce the number of db queries made per graphql query
// See: https://github.com/facebook/dataloader
//
// If additional queries need to be tuned for performance reasons, follow the
// example of the Waypoint resolver below and add additional loaders.

function GetLoaders() {
  return {
    DeliveriesById: new DataLoader(keys => loadDeliveriesById(keys)),
    UsersByUserId: new DataLoader(keys => loadUsersByUserId(keys)),
  }
}

/**
 * batch queries the delivery collection by the '_id' field.
 */
async function loadDeliveriesById(ids) {
  var deliveries = await Deliveries.find({'_id': {'$in': ids.map(i => ObjectId(i))}}).toArray();

  var byID = {};
  deliveries.map(d => { byID[d._id.toHexString()] = d; });

  return ids.map(i => byID[i] || null);
}

/**
 * batch queries the chatusers collection by the 'id' field (NOTE: not the _id
 * field)
 *
 * @param userIds - an array of user ids (e.g. ['U0PRBNLNS', 'U0PQN0T63'])
 */
async function loadUsersByUserId(userIds) {
  var users = await Chatusers.find({id: {'$in' : userIds }}).toArray();

  var usersByUserId = {}
  users.map(u => { usersByUserId[u.id] = u });

  return userIds.map(uid => usersByUserId[uid] || null);
}


/**
 * sets pagination parameters on the collection query if provided, or uses
 * defaults if not.
 *
 * @param coll - a collection from the database
 * @param args - query arguments
 * @param sort - sort option for results
 */
async function pagination(coll, args, sort) {
  let limit = args.limit || 10;
  delete args.limit;

  let skip = args.offset || 0;
  delete args.offset;

  let id = args._id;
  if (args._id) args._id = ObjectId(args._id);

  // TODO(Cameron): I'm assuming coll.find() is synchronous, and it's toArray()
  // that is asychronous?
  let q = coll.find(args);
  if (sort) q = q.sort(sort);
  q = await q.skip(skip).limit(limit).toArray();
  return q;
}


const Resolvers = {

  // Business objects

  Cart: {
    items: async ({_id}) => {
      return (await Items.find({ cart_id: _id }).sort({added_date: -1}).toArray());
    },
  },

  // Chatuser: {
  //   team: async ({team_id}) => {
  //     return (await Slackbots.findOne({ team_id: team_id }));
  //   },
  // },

  // Delivery: {
  //   team: async ({team_id}) => {
  //     return (await Slackbots.findOne({team_id: team_id}));
  //   }
  // },

  Item: {
    cart: async ({cart_id}) => {
      return (await Carts.findOne(ObjectId(cart_id)));
    }
  },

  Slackbot: {

    members: async ({ team_id }) => {
      return (await Chatusers.find({ team_id: team_id }).toArray());
    },
  //   carts: async ({team_id}) => {
  //     return (await Carts.find({ slack_id: team_id }).toArray());
  //   },
    deliveries: async({team_id}) => {
      let deliveries = await Deliveries.find({ team_id: team_id }).toArray();
      return deliveries;
    }
  },

  Waypoint: {
    user: async ({user_id}, _, context) => {
      return context.loaders.UsersByUserId.load(user_id);
    },
    delivery: async ({delivery_id}, _, context) => {
      return context.loaders.DeliveriesById.load(delivery_id);
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
      let deliveryArgs = {'cart.1': {'$exists': true}};
      // if (args.start_date) deliveryArgs.time_started['$gt'] = new Date(args.start_date)
      // if (args.end_date) deliveryArgs.time_started['$lt'] = new Date(args.end_date)
      // const res = await Deliveries.find({'time_started': {$gt: "2017-02-16 23:14:50"}}).limit(10).toArray();
      let res = await pagination(Deliveries, deliveryArgs);

      res = res.map((foodSession) => {
        // possibly other stuff related to team or whatever
        foodSession = prepareCafeCarts(foodSession);
        return foodSession;
      });

      return res;
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
      console.time('teams');
      let teams = await pagination(Slackbots, args);
      console.timeEnd('teams');
      return teams
    },

    users: async (root, args) => {
      return await pagination(Chatusers, args);
    },

    waypoints: async (root, args) => {
      return await pagination(Waypoints, args);
    },

  },

  Mutation: {
    setItemAsPurchased: async(_,{ itemId }) => {
      const item = Items.findOne(ObjectId(itemId));
      return await item.then(function(selectedItem){
        if (!selectedItem) {
          throw new Error(`Couldn't find item with id ${itemId}`);
        } else {
          Items.findOneAndUpdate({_id: ObjectId(itemId)}, {$set:{purchased:true}}, {new: true},function(err, doc){
            if(err){
              console.log("Something wrong when updating data!");
            }
          });
          return selectedItem;
        }
      });
    },
  },

};


export {
  GetLoaders,
  Resolvers,
}