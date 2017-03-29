const getBucketBanterCounts = require('./getBucketBanterCounts');
const getModeBanterCounts = require('./getModeBanterCounts');

const parse = results => {
  const banterCounts = {};
  results.forEach(result => {
    for (const source in result) {
      banterCounts[source] = banterCounts[source] ?
      banterCounts[source] + result[source] : result[source];
    }
  });
  return banterCounts;
};

const getBanterCounts = dbs =>
  new Promise((outerResolve, outerReject) => {
    const bucketPromises = new Promise((resolve, reject) => {
      const promises = dbs.map(messages => getBucketBanterCounts(messages));
      Promise.all(promises).then(results => {
        resolve(parse(results));
      });
    });
    const execPromises = new Promise((resolve, reject) => {
      const promises = dbs.map(messages => getModeBanterCounts(messages));
      Promise.all(promises).then(results => {
        resolve(parse(results));
      });
    });
    Promise.all([bucketPromises, execPromises]).then(results => {
      outerResolve(parse(results));
    });
  });

module.exports = getBanterCounts;
