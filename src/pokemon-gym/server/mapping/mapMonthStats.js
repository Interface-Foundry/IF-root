const getMonthStatsQuery = require('../queries/getMonthStats');

const parse = results => {
  const monthStats = {};
  results.forEach(result => {
    result.forEach(day => {
      const { idString, idNumber, sources } = day;
      monthStats[idString] = monthStats[idString] || {};
      monthStats[idString].idString = idString;
      monthStats[idString].idNumber = idNumber;

      sources.forEach(source => {
        monthStats[idString][source.name] = monthStats[idString][source.name] ?
        monthStats[idString][source.name] + source.num : source.num;
      });
    });
  });
  return monthStats;
};

const getMonthStats = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getMonthStatsQuery(messages));
    Promise.all(promises).then(results => {
      const monthsObject = parse(results);
      resolve(Object.keys(monthsObject).map(month => monthsObject[month]));
    });
  });

module.exports = getMonthStats;
