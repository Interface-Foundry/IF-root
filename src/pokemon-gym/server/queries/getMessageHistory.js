const date = require('../../helpers/date');
const getMessageHistory = (messages,user) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      
      {
        $group: {
          _id: {
            attachments: '$reply.data.attachments',
            actions: '$reply.data.attachments.actions',
            ts: '$ts'
          },
        },
      },
      {
        $sort: {'_id.ts': -1}
      },
      { $limit : 20 },
      /*
      {
        $unwind: "$_id.attachments", 
      },
      {
        $unwind: "$_id.actions", 
      },
      */
    ], (err, result) => {
      if (err) { reject(err); }
      const messages = result.map(message => {

        return {
          attachments: message._id.attachments,
          actions: message._id.actions,
          ts: message._id.ts
        };
      });
      resolve(messages);
    });
  });

module.exports = getMessageHistory;
if (!module.parent) {
  require('../../../kip')
  getMessageHistory(db.messages).then(console.log.bind(console))
}
