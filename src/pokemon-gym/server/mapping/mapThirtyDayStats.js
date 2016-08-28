const getThirtyDayStatsQuery = require('../queries/getThirtyDayStats');
// const getModeMonthStats = require('./getModeMonthStats');

const parse = results => {
  const thirtyDayStats = {};
  results.forEach(result => {
    result.forEach(day => {
      const { idString, idNumber, sources } = day;
      thirtyDayStats[idString] = thirtyDayStats[idString] || {};
      thirtyDayStats[idString].idString = idString;
      thirtyDayStats[idString].idNumber = idNumber;

      sources.forEach(source => {
        thirtyDayStats[idString][source.name] = thirtyDayStats[idString][source.name] ?
        thirtyDayStats[idString][source.name] + source.num : source.num;
      });
    });
  });
  return thirtyDayStats;
};

const getThirtyDayStats = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getThirtyDayStatsQuery(messages));
    Promise.all(promises).then(results => {
      const datesObject = parse(results);
      resolve(Object.keys(datesObject).map(month => datesObject[month]));
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

module.exports = getThirtyDayStats;
