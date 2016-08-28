const getBucketMonthStats = require('./getBucketMonthStats');
// const getModeMonthStats = require('./getModeMonthStats');

const parse = results => {
  const monthStats = {};
  results.forEach(result => {
    result.forEach(day => {
      const { monthString, monthNumber, sources } = day;
      monthStats[monthString] = monthStats[monthString] || {};
      monthStats[monthString].monthString = monthString;
      monthStats[monthString].monthNumber = monthNumber;

      sources.forEach(source => {
        monthStats[monthString][source.name] = monthStats[monthString][source.name] ?
        monthStats[monthString][source.name] + source.num : source.num;
      });
    });
  });
  return monthStats;
};

const getMonthStats = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(messages => getBucketMonthStats(messages));
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
