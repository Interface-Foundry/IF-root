var fs = require('fs')

var terms = module.exports = fs.readFileSync(__dirname + '/terms.tsv', 'utf8')
  .split('\r\n')
  .reduce(function(terms, row) {
    row = row.split('\t')
      .filter(function(q) { return !!q })
      .map(function(q) { return q.toLowerCase()})
    if (!row[0]) {
      return terms;
    }
    terms[row[0].toLowerCase()] = row.slice(1);
    return terms;
  }, {})
