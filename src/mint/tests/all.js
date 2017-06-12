const path = require('path')
const fs = require('fs')

const ignores = [
  'all.js',
  'amazon.tests.js',
  'api.js',
  'deals.js',
  'cart.tests.js',
  'invoice.test.js',
  'scrape_url.js',
  'ypo-cart.js',
  'ypo.js'
]

// run tests in parallel
const tests = fs.readdirSync(__dirname)
  .filter(f => !ignores.includes(f))
  .map(f => require('./' + f))
