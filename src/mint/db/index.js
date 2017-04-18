var Waterline = require('waterline');
var mongoAdapter = require('sails-mongo');

Waterline.isA = function (collection) {
  return {
    model: collection,
    via: 'id'
  };
};

Waterline.isMany = function (collection) {
  return {
    collection: collection,
    via: 'id'
  };
};

/**
 * Set up the database connections
 */
var waterline = new Waterline()
waterline.loadCollection(require('./carts'))
waterline.loadCollection(require('./items'))
waterline.loadCollection(require('./item_options'))
waterline.loadCollection(require('./amazon_items'))
waterline.loadCollection(require('./user_accounts'))
waterline.loadCollection(require('./sessions'))
waterline.loadCollection(require('./emails'))
waterline.loadCollection(require('./email_opens'))
waterline.loadCollection(require('./authentication_links'))
waterline.loadCollection(require('./camel_items'))
waterline.loadCollection(require('./amazon_blurbs'))

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
};

var initialize = new Promise((resolve, reject) => {
  waterline.initialize(config, (err, ontology) => {
    if (err) {
      console.error(err);
      return reject(err);
    }

    // Manually make the names for our manually defined schemas
    const models = {
      Carts: ontology.collections.carts,
      Items: ontology.collections.items,
      ItemOptions: ontology.collections.item_options,
      AmazonItems: ontology.collections.amazon_items,
      UserAccounts: ontology.collections.user_accounts,
      Sessions: ontology.collections.sessions,
      Emails: ontology.collections.emails,
      CamelItems: ontology.collections.camel_items,
      AmazonBlurbs: ontology.collections.amazon_blurbs,
      EmailOpens: ontology.collections.email_opens,
      AuthenticationLinks: ontology.collections.authentication_links
    };

    // Programmatically make available the automatically generated schemas
    Object.keys(ontology.collections).filter(k => k.includes('__')).map(k => {
      models[k] = ontology.collections[k]
    })

    resolve(models);
  });
});

module.exports = initialize;
