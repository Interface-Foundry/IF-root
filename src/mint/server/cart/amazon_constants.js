/**
 * List of credentials and affiliate ids for each locale
 * @type {Object}
 */
module.exports.credentials = {
  'US': [{
    'awsId': 'AKIAIQWK3QCI5BOJTT5Q',
    'awsSecret': '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',
    'assocId': 'motorwaytoros-20',
    'maxRequestsPerSecond': 1,
    'locale': 'US'
  }, {
    'awsId': 'AKIAJLM6YRRSPF4UQHOA',
    'awsSecret': '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',
    'assocId': 'motorwaytoros-20',
    'maxRequestsPerSecond': 1,
    'locale': 'US'
  }],
  'UK': [{
    'awsId': 'AKIAIQWK3QCI5BOJTT5Q',
    'awsSecret': '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',
    'assocId': 'mottoros-21',
    'maxRequestsPerSecond': 1,
    'locale': 'UK'
  }, {
    'awsId': 'AKIAJLM6YRRSPF4UQHOA',
    'awsSecret': '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',
    'assocId': 'mottoros-21',
    'maxRequestsPerSecond': 1,
    'locale': 'UK'
  }],
  'CA': [{
    'awsId': 'AKIAIQWK3QCI5BOJTT5Q',
    'awsSecret': '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',
    'assocId': 'motorwayca201-20',
    'maxRequestsPerSecond': 1,
    'locale': 'CA'
  }, {
    'awsId': 'AKIAJLM6YRRSPF4UQHOA',
    'awsSecret': '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',
    'assocId': 'motorwayca201-20',
    'maxRequestsPerSecond': 1,
    'locale': 'CA'
  }]
}

/**
 * Mapping of human-readable category names to amazon search index names for each locale
 * @type {Object}
 */
module.exports.categories = {
  'US': {
    "Appliances": 'Appliances',
    "Arts, Crafts, & Sewing": 'ArtsAndCrafts',
    "Automotive": 'Automotive',
    "Baby": 'Baby',
    "Beauty": 'Beauty',
    "Books": 'Books',
    "Collectibles & Fine Arts": 'Collectibles',
    "Electronics": 'Electronics',
    "Clothing, Shoes & Jewelry": 'Fashion',
    "Clothing, Shoes & Jewelry - Baby": "FashionBaby",
    "Clothing, Shoes & Jewelry - Boys": "FashionBoys",
    "Clothing, Shoes & Jewelry - Girls": "FashionGirls",
    "Clothing, Shoes & Jewelry - Men": "FashionMen",
    "Clothing, Shoes & Jewelry - Women": "FashionWomen",
    "Gift Cards": 'GiftCards',
    "Grocery & Gourmet Food": 'Grocery',
    "Handmade": 'Handmade',
    "Health & Personal Care": 'HealthPersonalCare',
    "Home & Kitchen": 'HomeGarden',
    "Industrial & Scientific": 'Industrial',
    "Kindle Store": "KindleStore",
    "Patio, Lawn & Garden": 'LawnAndGarden',
    "Luggage & Travel Gear": 'Luggage',
    "Magazine Subscriptions": 'Magazines',
    "Apps & Games": 'MobileApps',
    "Movies & TV": 'Movies',
    "Digital Music": 'MP3Downloads',
    "CDs & Vinyl": 'Music',
    "Musical Instruments": 'MusicalInstruments',
    "Office Products": 'OfficeProducts',
    "Prime Pantry": 'Pantry',
    "Computers": 'PCHardware',
    "Pet Supplies": 'PetSupplies',
    "Software": 'Software',
    "Sports & Outdoors": 'SportingGoods',
    "Tools & Home Improvement": 'Tools',
    "Toys and Games": 'Toys',
    "Amazon Instant Video": 'UnboxVideo',
    "Vehicles": 'Vehicles',
    "Video Games": 'VideoGames',
    "Wine": 'Wine',
    "Cell Phones & Accessories": 'Wireless'
  },

  // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/LocaleUK.html
  'UK': {
    "Clothing": "Apparel",
    "Large Appliances": 'Appliances',
    "Car & Motorbike": 'Automotive',
    "Baby": 'Baby',
    "Beauty": 'Beauty',
    "Books": 'Books',
    "Classical": "Classical",
    "DVD & Blu-ray": "DVD",
    "Electronics": 'Electronics',
    "Gift Cards": 'GiftCards',
    "Grocery": 'Grocery',
    "Handmade": 'Handmade',
    "Health & Personal Care": 'HealthPersonalCare',
    "Garden & Outdoors": 'HomeGarden',
    "Industrial & Scientific": 'Industrial',
    "Jewellery": "Jewelry",
    "Kindle Store": "KindleStore",
    "Kitchen & Home": "Kitchen",
    "Lighting": "Lighting",
    "Luggage": 'Luggage',
    "Apps & Games": 'MobileApps',
    "Digital Music": 'MP3Downloads',
    "CDs & Vinyl": 'Music',
    "Musical Instruments & DJ": 'MusicalInstruments',
    "Stationery & Office Supplies": 'OfficeProducts',
    "Amazon Pantry": 'Pantry',
    "Computers": 'PCHardware',
    "Pet Supplies": 'PetSupplies',
    "Shoes & Bags": "Shoes",
    "Software": 'Software',
    "Sports & Outdoors": 'SportingGoods',
    "DIY & Tools": 'Tools',
    "Toys & Games": 'Toys',
    "Amazon Instant Video": 'UnboxVideo',
    "VHS": "VHS",
    "PC & Video Games": 'VideoGames',
    "Watches": "Watches"
  },

  // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/LocaleCA.html
  'CA': {
    "Clothing & Accessories": "Apparel",
    "Automotive": 'Automotive',
    "Baby": 'Baby',
    "Beauty": 'Beauty',
    "Books": 'Books',
    "Movies & TV": "DVD",
    "Electronics": 'Electronics',
    "Gift Cards": 'GiftCards',
    "Grocery & Gourmet Food": 'Grocery',
    "Health & Personal Care": 'HealthPersonalCare',
    "Industrial & Scientific": 'Industrial',
    "Jewelry": "Jewelry",
    "Kindle Store": "KindleStore",
    "Home & Kitchen": "Kitchen",
    "Patio, Lawn & Garden": 'LawnAndGarden',
    "Luggage & Bags": 'Luggage',
    "Apps & Games": 'MobileApps',
    "Music": 'Music',
    "Musical Instruments, Stage & Studio": 'MusicalInstruments',
    "Office Products": 'OfficeProducts',
    "Pet Supplies": 'PetSupplies',
    "Shoes & Handbags": "Shoes",
    "Software": 'Software',
    "Sports & Outdoors": 'SportingGoods',
    "Tools & Home Improvement": 'Tools',
    "Toys and Games": 'Toys',
    "Video Games": 'VideoGames',
    "Watches": "Watches"
  }
}
