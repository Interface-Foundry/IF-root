const getMonthStatsQuery = require('../queries/getMonthStats');
// const getModeMonthStats = require('./getModeMonthStats');

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
    // const modePromises = new Promise((resolve, reject) => {
    //   const promises = dbs.map(messages => getModeMonthStats(messages));
    //   Promise.all(promises).then(results => {
    //     resolve(parse(results));
    //   });
    // });
    // Promise.all([bucketPromises, modePromises]).then(results => {
    // Promise.all([bucketPromises]).then(results => {
    //   outerResolve(parse(results));
    // });
  });

module.exports = getMonthStats;
