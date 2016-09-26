const getItems = require('../queries/getItems');

const parse = results => {
  const allResults = [].concat.apply([], results);
  const groups = [];
  allResults.forEach(item => {
    const group = groups.find(result => result.name === item.productGroup);
    if (group) {
      group.count++;
      const product = group.products.find(p => p.name === item.product);
      if (product) product.count++;
      else {
        group.products.push({ name: item.product, count: 1 });
      }
      return;
    }
    groups.push({
      name: item.productGroup,
      count: 1,
      products: [{ name: item.product, count: 1 }],
    });
  });
  return groups;
};

const itemsMap = dbs =>
  new Promise((resolve, reject) => {
    const promises = dbs.map(items => getItems(items));
    Promise.all(promises).then(results => {
      resolve(parse(results));
    });
  });

module.exports = itemsMap;
