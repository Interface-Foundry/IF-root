const fs = require('fs')
const path = require('path')
const _ = require('lodash')

//
// Create the category mappings in the same format as amazon
// cateoryFile contains subcategory counts, check out the json file if you want
//
const categoryFile = JSON.parse(fs.readFileSync(path.join(__dirname, '../../ingest/categories.json'), 'utf8'))

module.exports.categories = Object.keys(categoryFile)
  .map(category => ({
    category: category,
    count: Object.keys(categoryFile[category]).reduce((count, subcategory) => count + categoryFile[category][subcategory], 0)
  }))
  .sort((a, b) => b.count - a.count)
  // .map(categoryInfo => categoryInfo.category)
  // .reduce((categories, category) => {
    // categories[category] = category
    // return categories
  // }, {})
