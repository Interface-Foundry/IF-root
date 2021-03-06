module.exports = {
  // length of cart id, not sure what compromise between looking fine and getting scraped
  CART_ID_LENGTH: 12,
  MAGIC_URL_LENGTH: 32,

  // available stores we are supporting atm
  STORES: ['YPO', 'Amazon', 'Muji'],
  LOCALES: ['US', 'CA', 'GB', 'JP'],
  PAYMENT_SOURCE: ['stripe'],
  UUID_REGEX: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
};
