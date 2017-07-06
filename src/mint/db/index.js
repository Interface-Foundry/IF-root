var Waterline = require('waterline');
var mongoAdapter = require('sails-mongo');

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/mint';

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
waterline.loadCollection(require('./addresses'))
waterline.loadCollection(require('./amazon_blurbs'))
waterline.loadCollection(require('./amazon_items'))
waterline.loadCollection(require('./authentication_links'))
waterline.loadCollection(require('./camel_items'))
waterline.loadCollection(require('./carts'))
waterline.loadCollection(require('./checkout_events'))
waterline.loadCollection(require('./conversions'))
waterline.loadCollection(require('./delivery_details'))
waterline.loadCollection(require('./email_events'))
waterline.loadCollection(require('./emails'))
waterline.loadCollection(require('./feedback'))
waterline.loadCollection(require('./invoices'))
waterline.loadCollection(require('./item_options'))
waterline.loadCollection(require('./items'))
waterline.loadCollection(require('./payments'))
waterline.loadCollection(require('./payment_sources'))
waterline.loadCollection(require('./raw_html'))
waterline.loadCollection(require('./reactions'))
waterline.loadCollection(require('./sessions'))
waterline.loadCollection(require('./translations'))
waterline.loadCollection(require('./user_accounts'))
waterline.loadCollection(require('./ypo_inventory_items'))

var config = {
  adapters: {
    'mongo': mongoAdapter
  },

  connections: {
    default: {
      adapter: 'mongo',
      url: url
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
      Addresses: ontology.collections.addresses,
      AmazonBlurbs: ontology.collections.amazon_blurbs,
      AmazonItems: ontology.collections.amazon_items,
      AuthenticationLinks: ontology.collections.authentication_links,
      CamelItems: ontology.collections.camel_items,
      Carts: ontology.collections.carts,
      CheckoutEvents: ontology.collections.checkout_events,
      Conversions: ontology.collections.conversions,
      DeliveryDetails: ontology.collections.delivery_details,
      EmailEvents: ontology.collections.email_events,
      Emails: ontology.collections.emails,
      Feedback: ontology.collections.feedback,
      Invoices: ontology.collections.invoices,
      ItemOptions: ontology.collections.item_options,
      Items: ontology.collections.items,
      Payments: ontology.collections.payments,
      PaymentSources: ontology.collections.payment_sources,
      RawHtml: ontology.collections.raw_html,
      Reactions: ontology.collections.reactions,
      Sessions: ontology.collections.sessions,
      Translations: ontology.collections.translations,
      UserAccounts: ontology.collections.user_accounts,
      YpoInventoryItems: ontology.collections.ypo_inventory_items
    };

    // Programmatically make available the automatically generated schemas
    Object.keys(ontology.collections).filter(k => k.includes('__')).map(k => {
      models[k] = ontology.collections[k]
    })

    // open up another connection for raw queries
    require('mongodb').MongoClient.connect(url, function(err, db) {
      models.RawConnection = db
      resolve(models)
    });
  });
});

module.exports = initialize;
