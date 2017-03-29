const getPurchasedCafeCartItems = require('./getPurchasedCafeCartItems');
const getPurchasedStoreCartItems = require('./getPurchasedStoreCartItems');

const getTeams = (slackbots) =>
  new Promise((resolve, reject) => {
    slackbots.aggregate([
      {
        $group: {
          _id: {
            name: '$team_name',
            id: '$team_id',
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const teams = result.map(team => {
        return {
          name: team._id.name,
          id: team._id.id
        };
      });
      resolve(teams);
    });
  });

const getStoreCartItemCount = (team, carts, start, end) =>
  new Promise((resolve, reject) => {
    var purchasedStoreCartItems = getPurchasedStoreCartItems(carts, start, end)

    purchasedStoreCartItems.then(function(cartItems){
      var item_count = cartItems.filter(function(cart){return cart.GroupID === team.id;}).length     
      resolve(item_count)
    })

  });


const getStoreOrderCount = (team, carts, start, end) =>
   new Promise((resolve, reject) => {
     var purchasedStoreCartItems = getPurchasedStoreCartItems(carts, start, end)

    purchasedStoreCartItems.then(function(cartItems){
      var uniqueOrders = new Set();
      cartItems.map(function(cart) { 
        if(cart.GroupID == team.id){  
          uniqueOrders.add(cart.GroupID);
        }
      });
      resolve(uniqueOrders.size)
    })


  });



const getCafeCartItemCount = (team, delivery, start, end) =>
  new Promise((resolve, reject) => {
    var purchasedCafeCartItems = getPurchasedCafeCartItems(delivery, start, end)

    purchasedCafeCartItems.then(function(cartItems){
       var item_count = cartItems.filter(function(cart){return cart.team_id === team.id;}).length     
       resolve(item_count)
    })

  });




const getCafeOrderCount = (team, delivery,start,end) =>
  new Promise((resolve, reject) => {
    var purchasedCafeCartItems = getPurchasedCafeCartItems(delivery, start, end)

    purchasedCafeCartItems.then(function(cartItems){
      var uniqueOrders = new Set();
      cartItems.map(function(cart) { 
        if(cart.team_id == team.id){  
          uniqueOrders.add(cart.cartToken);
        }
      });
      resolve(uniqueOrders.size)
    })


  });


const getTeamStats = (slackbots, carts, delivery, start, end) =>
  new Promise((resolve, reject) => {
    var teams = getTeams(slackbots)


    var team_ids = []

    teams.then(function(teamArray){

      team_stats = teamArray.map((team) => {
        var storeCartItemCount = getStoreCartItemCount(team, carts, start, end)
        var storeOrderCount = getStoreOrderCount(team, carts, start, end)
        var cafeCartItemCount = getCafeCartItemCount(team, delivery, start, end)
        var cafeOrderCount = getCafeOrderCount(team, delivery,start,end)
        Promise.all([storeCartItemCount,storeOrderCount,cafeCartItemCount,cafeOrderCount]).then(values => {console.log(team.id,': ',values)})
      })

    })
  });



module.exports = getTeamStats;
if (!module.parent) {
  require('../../../../kip')
  getTeamStats(db.slackbots, db.carts, db.delivery, new Date(new Date().setDate(new Date().getDate()-365)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console))
}

