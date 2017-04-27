/**
 * @file Defines the resolvers for the different schemas being used.
 */

import { ObjectId } from 'mongodb';
import GraphQLToolsTypes from 'graphql-tools-types';
import DataLoader from 'dataloader';
import _ from 'lodash';

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

import Menu from '../../../chat/components/delivery.com/Menu';

// if you want to use mongoose/db.whatever uncomment this
// import db from "../../../../../db/index.js"


/**
 * get the date from args if using start_date and end_date in graphql query
 * @param  {object} args object with possible start and end dates
 * @param  {string} property for mongodb object that search date for
 * @return {object} args object
 */
function getDateFromArgs(args, datePropertyString) {
  let dateArgs;
  const newArgs = args;

  if (newArgs.start_date || newArgs.end_date) {
    dateArgs = {};
  } else {
    return newArgs;
  }
  if (newArgs.start_date) {
    dateArgs.$gt = new Date(newArgs.start_date);
    delete newArgs.start_date;
  }
  if (newArgs.end_date) {
    dateArgs.$lt = new Date(newArgs.end_date);
    delete newArgs.end_date;
  }
  newArgs[datePropertyString] = dateArgs;

  return newArgs;
}

/**
 * prepare graphql response for query about delivery items
 * @param  {[type]} foodSession [description]
 * @return {[type]}             [description]
 */
// function prepareCafeCarts(foodSession) {

//   var cartLength=0;
//   foodSession.cart_total = `$0.00`;
//   if(foodSession.cart){
//     for(var i = 0; i<foodSession.cart.length; i++){
//       if(foodSession.cart[i].added_to_cart){
//         cartLength+=foodSession.cart[i].item.item_qty;
//       }
//     }
//   }

//   if (cartLength > 0) {
//     foodSession.cart_total = `$${Number(foodSession.calculated_amount).toFixed(2)}`;
//     foodSession.cart = foodSession.cart;
//   }
//   foodSession.item_count = cartLength;

//   return foodSession;
// }

/**
 * prepare graphql response object for query about amazon carts
 * @param  {object} cart object - currently from amazon only
 * @return {object} cart object
 */
async function prepareStoreCarts(cart, purchasedObj) {

  const itemArgs = _.merge({ cart_id: cart._id }, purchasedObj);
  cart.items = await Items.find(itemArgs).sort({ added_date: -1 }).toArray();

  if (cart.items.length === 0) {
    return null;
  }
  return cart;
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
    UserNameById: new DataLoader(keys => getUserNameById(keys)),
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


async function getUserNameById(userId) {
  var user = await Chatusers.findOne({ id: userId }, { name: 1, _id:0 });
  return user;
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
  //
  Delivery: {
    type: () => 'slack',
    cart_total: (obj) => {
      if (obj.calculated_amount) {
        return `$${Number(obj.calculated_amount).toFixed(2)}`;
      }
      return '$0.00';
    },
    item_count: (foodSession) => {
      let cartLength = 0;
      if (foodSession.cart) {
        for (let i = 0; i < foodSession.cart.length; i++) {
          if (foodSession.cart[i].added_to_cart) {
            cartLength += foodSession.cart[i].item.item_qty;
          }
        }
      }
      return cartLength;
    },
    chosen_restaurant: (obj) => {
      return _.get(obj, 'chosen_restaurant.name')
    },
    items: async (obj, args, context, info) => {
      if (!obj.menu) {
        return [];
      }
      const menuObj = Menu(obj.menu);
      return obj.cart.map(async (i) => {
        if(i.item){
          const item = menuObj.flattenedMenu[i.item.item_id];
          let userName = await context.loaders.UsersByUserId.load(i.user_id);
          userName = userName.name;
          return {
            item_name: item ? item.name : 'name unavail',
            // either need to convert id to name here or with context in the resolver
            user: userName,
          };
        } else {
          return {
            item_name: 'name unavail',
            userName: 'n/a'
          }
        }
      });
    },

    team: async ({team_id}) => {
      return (await Slackbots.findOne({team_id: team_id}));
    },
  },

  Cart: {


    cart_total: (obj) => {
      if (_.get(obj, 'amazon.SubTotal')) {
        return `$${Number(obj.amazon.SubTotal[0].Amount / 100.0).toFixed(2)}`;
      }
      return 'No Cart Subtotal';
    },
    created_date: (obj) => new Date(obj.created_date).toDateString(),
    items: async ({ _id }, args) => {
      // possible to get the value per item if needed using
      const itemArgs = {
        cart_id: ObjectId(_id),
      }
      if (args.purchased !== undefined) {
        itemArgs.purchased = args.purchased;
      }
      const items = await Items.find(itemArgs).sort({ added_date: -1 }).toArray();
      return items;
    },
    item_count: (obj) => {
      if (obj.items) {
        return obj.items.length;
      }
      return 0;
    },
    team: async (obj) => {
      let team = await Slackbots.findOne({team_id: obj.slack_id});
      return team;
    },
    type: () => 'slack',
  },

  Chatuser: {
    team: async ({team_id}) => {
      let team = await Slackbots.findOne({ 'team_id': team_id });
      return team;
    },
  },

  Item: {
    cart: async ({cart_id}) => {
      return (await Carts.findOne(ObjectId(cart_id)));
    },
  },

  Slackbot: {

    members: async ({ team_id }) => {
      return (await Chatusers.find({ team_id: team_id }).toArray());
    },
    carts: async ({team_id}) => {
      let carts = await Carts.find({ slack_id: team_id }).toArray();
      return carts;
    },
    deliveries: async (obj, args) => {
      let res = await Deliveries.find({ team_id: obj.team_id }, {menu: 0}).limit(args.limit).toArray();
      return res;
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
      const newArgs = getDateFromArgs(args, 'created_date');
      let res = await pagination(Carts, newArgs);
      res = res.filter(cart => cart.items.length > 0);
      return res;
    },

    deliveries: async (root, args) => {
      const newArgs = getDateFromArgs(args, 'time_started');
      let res = await pagination(Deliveries, newArgs);
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
      let teams = await pagination(Slackbots, args);
      return teams
    },

    users: async (root, args) => {
      return await pagination(Chatusers, args);
    },

    waypoints: async (root, args) => {
      return await pagination(Waypoints, args);
    }

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
