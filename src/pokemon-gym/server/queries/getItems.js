const getSearchCounts = (messages) =>
  new Promise((resolve, reject) => {
    messages.find({ source_json: { $exists: true } }, { source_json: 1 }, (err, result) => {
      // debugger;
      if (err) { console.log(err); reject(err); return; }
      const items = result.map(item => {
        const parsed = JSON.parse(item.toObject().source_json);
        if (!parsed || !parsed.ItemAttributes.length) return null;
        const productGroup = parsed.ItemAttributes[0].ProductGroup[0];
        const product = parsed.ItemAttributes[0].Title[0];
        return { product, productGroup };
      });
      resolve(items.filter(item => item));
    });
  });

module.exports = getSearchCounts;
