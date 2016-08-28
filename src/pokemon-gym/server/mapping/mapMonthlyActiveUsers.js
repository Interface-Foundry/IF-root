const getMonthlyActiveUsersQuery = require('../queries/getMonthlyActiveUsers');

const parse = results => {
  const dailyActiveUsers = {};
  results.forEach(result => {
    result.forEach(day => {
      const { idString, idNumber, sources } = day;
      dailyActiveUsers[idString] = dailyActiveUsers[idString] || {};
      dailyActiveUsers[idString].idString = idString;
      dailyActiveUsers[idString].idNumber = idNumber;

      sources.forEach(source => {
        dailyActiveUsers[idString][source.name] = dailyActiveUsers[idString][source.name] ?
        dailyActiveUsers[idString][source.name] + source.num : source.num;
      });
    });
  });
  return dailyActiveUsers;
};

const getDailyActiveUsers = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getMonthlyActiveUsersQuery(messages));
    Promise.all(promises).then(results => {
      const datesObject = parse(results);
      resolve(Object.keys(datesObject).map(month => datesObject[month]));
    });
  });

module.exports = getDailyActiveUsers;
