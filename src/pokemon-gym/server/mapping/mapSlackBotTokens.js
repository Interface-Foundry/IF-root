const getSlackBotTokens = require('../queries/getSlackBotTokens');

const mapSlackBotTokens = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(slackbots => getSlackBotTokens(slackbots));
    Promise.all(promises).then(results => {
      let allTokens = [];
      results.forEach(tokens => {
        const uniqueTokens = tokens.filter(token => allTokens.indexOf(token) < 0);
        allTokens = allTokens.concat(uniqueTokens);
      });
      resolve(allTokens);
    });
  });

module.exports = mapSlackBotTokens;
