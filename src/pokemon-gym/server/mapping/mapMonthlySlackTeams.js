const getMonthlySlackTeamsQuery = require('../queries/getMonthlySlackTeams');

const parse = results => {
  const dailyActiveUsers = {};
  results.forEach(result => {
    result.forEach(month => {
      const { idString, idNumber } = month;
      dailyActiveUsers[idString] = dailyActiveUsers[idString] || {};
      dailyActiveUsers[idString].idString = idString;
      dailyActiveUsers[idString].idNumber = idNumber;

      dailyActiveUsers[idString].teams = dailyActiveUsers[idString].teams ?
      dailyActiveUsers[idString].teams + month.teams : month.teams;
    });
  });
  return dailyActiveUsers;
};

const getDailyActiveUsers = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getMonthlySlackTeamsQuery(messages));
    Promise.all(promises).then(results => {
      const datesObject = parse(results);
      resolve(Object.keys(datesObject).map(month => datesObject[month]));
    });
  });

module.exports = getDailyActiveUsers;
