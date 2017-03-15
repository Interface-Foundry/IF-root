var fs = require('fs')
var ejs = require('ejs')

console.log('compiling ejs email templates')

/** Compile all the .html files found in email_templates folder */
const templates = fs.readdirSync(__dirname).reduce((templates, name) => {
  if (name.endsWith('.html')) {
    templates[name.slice(0, -5)] = ejs.compile(fs.readFileSync(__dirname + '/' + name, 'utf8'))
  }

  return templates
}, {})

/** function to compile an email template with given data */
module.exports = function (template, data) {
  if (templates[template]) {
    return templates[template](data)
  } else {
    throw new Error(`Email Template "${template}" not found`)
  }
}
