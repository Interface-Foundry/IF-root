const getBucketDayOfWeekStats = require('../queries/getDayOfWeekStats');
// const getModeDayOfWeekStats = require('./getModeDayOfWeekStats');

const parse = results => {
  const dayStats = {};
  results.forEach(result => {
    result.forEach(day => {
      const { idString, idNumber, sources } = day;
      dayStats[idString] = dayStats[idString] || {};
      dayStats[idString].idString = idString;
      dayStats[idString].idNumber = idNumber;

      sources.forEach(source => {
        dayStats[idString][source.name] = dayStats[idString][source.name] ?
        dayStats[idString][source.name] + source.num : source.num;
      });
    });
  });
  return dayStats;
};

const getDayStats = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getBucketDayOfWeekStats(messages));
    Promise.all(promises).then(results => {
      const daysObject = parse(results);
      resolve(Object.keys(daysObject).map(day => daysObject[day]));
    });
    // const modePromises = new Promise((resolve, reject) => {
    //   const promises = dbs.map(messages => getModeDayOfWeekStats(messages));
    //   Promise.all(promises).then(results => {
    //     resolve(parse(results));
    //   });
    // });
    // Promise.all([bucketPromises, modePromises]).then(results => {
    // Promise.all([bucketPromises]).then(results => {
    //   outerResolve(parse(results));
    // });
  });

module.exports = getDayStats;
