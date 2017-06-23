module.exports = {
  // length of cart id, not sure what compromise between looking fine and getting scraped
  CART_ID_LENGTH: 12,
  MAGIC_URL_LENGTH: 32,

  // available stores we are supporting atm
  STORES: ['YPO', 'Amazon'],
  LOCALES: ['US', 'CA', 'GB'],
  PAYMENT_SOURCE: ['stripe']
};
