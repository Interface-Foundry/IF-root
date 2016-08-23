const getBucketSearchCounts = require('./getBucketSearchCounts');
const getExecSearchCounts = require('./getExecSearchCounts');

const parse = results => {
  const searchCounts = {};
  results.forEach(result => {
    for (const type in result) {
      searchCounts[type] = searchCounts[type] || {};
      for (const source in result[type]) {
        searchCounts[type][source] = searchCounts[type][source] ?
        searchCounts[type][source] + result[type][source] : result[type][source];
      }
    }
  });
  return searchCounts;
};

const getSearchCounts = dbs =>
  new Promise((outerResolve, outerReject) => {
    const bucketPromises = new Promise((resolve, reject) => {
      const promises = dbs.map(messages => getBucketSearchCounts(messages));
      Promise.all(promises).then(results => {
        resolve(parse(results));
      });
    });
    const execPromises = new Promise((resolve, reject) => {
      const promises = dbs.map(messages => getExecSearchCounts(messages));
      Promise.all(promises).then(results => {
        resolve(parse(results));
      });
    });
    Promise.all([bucketPromises, execPromises]).then(results => {
      outerResolve(parse(results));
    });
  });

module.exports = getSearchCounts;
