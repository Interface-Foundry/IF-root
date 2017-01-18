const date = require('../../helpers/date');
const getActiveSessions = (delivery) =>
  new Promise((resolve, reject) => {
    delivery.aggregate([
      /*
      {
        $match:
        {
          'active': true,
        },
      },
      */
      {
        $unwind: "$team_members",
      },
      {
        $group: {
          _id: {
            team_id: '$team_id',
            //all_members: '$all_members',
          },
          team_members: {$addToSet: '$team_members.name'},
          active: {$addToSet: '$active'},
        },
      },
/*
      { $group: {
          _id: {
            team_id: '$_id.team_id',
            //all_members: '$_id.all_members',
            //team_members: '$team_members',
            //active: '$active',
          },
          team_members: {$addToSet: '$team_members'},
          active: {$addToSet: '$active'},
        },
      }, 
*/
/*
      {
        $unwind: "$team_members",
      },
*/    
    ], (err, result) => {
      if (err) { reject(err); }
      const sessions = result.map(session => {
        return {
          team_id: session._id.team_id,
          //all_members: session._id.all_members,
          team_members: session.team_members,
          //team_members_id: session._id.team_members.id,
          active: session.active,
        };
      });
      resolve(sessions);
    });
  });

module.exports = getActiveSessions;
if (!module.parent) {
  require('../../../kip')
  getActiveSessions(db.delivery).then(console.log.bind(console)) //orders of past week
}
