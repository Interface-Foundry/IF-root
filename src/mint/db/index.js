var Waterline = require('waterline')
var mongoAdapter = require('sails-mongo')

/**
 * Set up the database connections
 */
var waterline = new Waterline()
waterline.loadCollection(require('./user_accounts'))
waterline.loadCollection(require('./sessions'))

var config = {
  adapters: {
    'mongo': mongoAdapter
  },

  connections: {
    default: {
      adapter: 'mongo',
      host: 'localhost',
      port: 27017,
      database: 'mint'
    }
  }
}

var initialize = new Promise((resolve, reject) => {
waterline.initialize(config, (err, ontology) => {
  if (err) {
    console.error(err)
    return reject(err)
  }

  const models = {
    UserAccounts: ontology.collections.user_accounts,
    Sessions: ontology.collections.sessions
  }
  resolve(models)
})
})

module.exports = initialize

