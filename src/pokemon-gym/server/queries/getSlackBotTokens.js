const getSlackBotTokens = (slackbots) =>
  new Promise((resolve, reject) => {
    slackbots.aggregate([
      {
        $group: {
          _id: '$bot.bot_access_token',
        },
      },
      {
        $group: {
          _id: 'slackbots',
          count: {
            $sum: 1,
          },
          tokens: {
            $addToSet: '$_id',
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); return; }
      const tokens = result[0] ? result[0].tokens : [];
      resolve(tokens);
    });
  });

module.exports = getSlackBotTokens;
