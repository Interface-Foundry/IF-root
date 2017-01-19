const date = require('../../helpers/date');
const getMessageHistory = (messages,user) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match: {
          ts: {
            $gte: new Date(new Date().setDate(new Date().getDate()-2))
          }
        }
      },
      {
        $group: {
          _id: {
            attachments: '$reply.data.attachments',
            actions: '$reply.data.attachments.actions',
            original_text: '$original_text',
            data: '$data.value',
            user: '$user_id',
            ts: '$ts'
          },
        },
      },
      {
        $sort: {'_id.ts': -1}
      },
      { $limit : 50 },
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
          original_text: message._id.original_text,
          data: message._id.data,
          user: message._id.user,
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
