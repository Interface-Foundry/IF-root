const date = require('../../helpers/date');
const getActiveSessions = (delivery) =>
  new Promise((resolve, reject) => {
    delivery.aggregate([
      {
        $unwind: "$team_members",
      },
      {
        $group: {
          _id: {
            team_id: '$team_id',
          },
          team_members: {$addToSet: '$team_members.name'},
          active: {$last: '$active'},
        },
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const sessions = result.map(session => {
        return {
          team_id: session._id.team_id,
          team_members: session.team_members,
          active: session.active,
        };
      });
      resolve(sessions);
    });
  });

module.exports = getActiveSessions;
if (!module.parent) {
  require('../../../kip')
  getActiveSessions(db.delivery).then(console.log.bind(console))
}
