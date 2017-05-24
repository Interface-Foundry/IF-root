module.exports = {
  // length of cart id, not sure what compromise between looking fine and getting scraped
  CART_ID_LENGTH: 12,
  MAGIC_URL_LENGTH: 32,

  // available stores we are supporting atm
  STORES: ['ypo', 'amazon'],
  LOCALES: ['US', 'CA', 'UK'],

  // PAYMENTS/INVOICES
  INVOICE_TYPE: ['mint', 'cafe'],

  /** dont know if we will support paypal but just for example */
  PAYMENT_SOURCE: ['amazon', 'stripe']
};
