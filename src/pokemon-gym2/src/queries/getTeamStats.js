//how many items purchased in shopping 
//how many items purchased in cafe  
// # shopping orders
// # cafe orders
//how many members in the team

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



const getTeamStats = (slackbots, delivery, start, end) =>
  new Promise((resolve, reject) => {
    var teams = getTeams(slackbots)


    var team_ids = []

    teams.then(function(teamArray){

      team_stats = teamArray.map((team) => { //for each team

      // get # items purchased in shopping (cart schema) filter by team.id
      var purchasedStoreCartItems = getPurchasedStoreCartItems(carts, start, end)
      

      // get # items purchased in cafe (delivery schema) filter by team.id
      var purchasedCafeCartItems = getPurchasedCafeCartItems(delivery, start, end)


      // get # shopping orders (from purchasedStoreCartItems, get unique GroupID)
      


      // get # cafe orders ( from purchasedCafeCartItems, get unique cartTokens )



/*
        delivery.aggregate([
          {

          }
          {
            $group: {
              _id: {
                team_id: '$team_id',
              },
              count: { $sum: 1 },
              carts: { $push: {cart: '$cart'}  },
            },
          },

        ], (err, result) => {
          if (err) { reject(err); }
          const carts = result.map(cart => {
            return {
              team_id: cart._id.team_id,
              count: cart.count,
              //cart: cart.carts,
            };
          });
          resolve(carts);
        });
*/

      })


    })
  });



module.exports = getTeamStats;
if (!module.parent) {
  require('../../../kip')
  getTeamStats(db.slackbots, db.delivery, new Date(new Date().setDate(new Date().getDate()-365)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console))
}

