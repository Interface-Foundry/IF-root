var Waterline = require('waterline')
var mongoAdapter = require('sails-mongo')

/**
 * Set up the database connections
 */
var waterline = new Waterline()
waterline.loadCollection(require('./carts'))
waterline.loadCollection(require('./items'))
waterline.loadCollection(require('./user_accounts'))
waterline.loadCollection(require('./sessions'))
waterline.loadCollection(require('./emails'))
waterline.loadCollection(require('./camel_items'))

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
      Carts: ontology.collections.carts,
      Items: ontology.collections.items,
      UserAccounts: ontology.collections.user_accounts,
      Sessions: ontology.collections.sessions,
      Emails: ontology.collections.emails,
      CamelItems: ontology.collections.camel_items
    }
    resolve(models)
  })
})

module.exports = initialize
