const getMonthlyActiveUsersQuery = require('../queries/getMonthlyActiveUsers');

const parse = results => {
  const monthlyActiveUsers = {};
  results.forEach(result => {
    result.forEach(day => {
      const { idString, idNumber, sources } = day;
      monthlyActiveUsers[idString] = monthlyActiveUsers[idString] || {};
      monthlyActiveUsers[idString].idString = idString;
      monthlyActiveUsers[idString].idNumber = idNumber;

      sources.forEach(source => {
        monthlyActiveUsers[idString][source.name] = monthlyActiveUsers[idString][source.name] ?
        monthlyActiveUsers[idString][source.name] + source.num : source.num;
      });
    });
  });
  return monthlyActiveUsers;
};

const getMonthlyActiveUsers = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getMonthlyActiveUsersQuery(messages));
    Promise.all(promises).then(results => {
      const datesObject = parse(results);
      resolve(Object.keys(datesObject).map(month => datesObject[month]));
    });
  });

module.exports = getMonthlyActiveUsers;
