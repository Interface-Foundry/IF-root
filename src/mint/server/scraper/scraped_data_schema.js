{ 
  /** @type {string} original link posted */
  original_link: 'string',

  raw_html: 'string', //relational DB id for the saved raw html

  //translated product name into user language
  name: 'string',

  //non-translated product name from original site
  original_name: {
    type:'string', //language locale, i.e. ko_KR 
    value:'string', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on:'date', //date of translation
    translate_to:'string' //i.e. translated to en-us locale 
  },

  domain: {
    name: 'string', //muji.net
    description: 'string', //Muji Japan Store
    thumbnail_url: 'string', //brand logo 
    main_image_url: 'string', //brand logo large 
    country: 'string', // domain country
    currency: 'string', // domain currency 
    locale: 'string' //domain locale (default on page visit)
  }, 

  user: {
    country: 'string', //US
    locale: 'string', //en-US
    currency: 'string' //USD
  }
  
  /** generalized ASIN-style unique ID for the product**/
  product_id: 'string', //i.e. muji: 4549738522515

  /** some product codes are options (i.e. blue size 10) inside parent product (i.e. shirt). default it repeats product_code **/
  parent_id: 'string', //i.e. muji: 38522515

  /** translated description text */
  description: 'string',

  original_description: {
    type:'string', //language locale, i.e. ko_KR 
    value:'string', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on:'date', //date of translation
    translate_to:'string' //i.e. translated to en-us locale 
  },

  //currency converted price into user currency
  price: 'float',

  //non-currency converted price from original site
  original_price: {
    type:'string', //currency type, i.e. SKW  
    value:'float', //original value in SKW
    fx_rate:'float', // foreign exchange rate
    fx_rate_src:'string', //fx rate source, i.e. fixer.io
    fx_on:'date', //date of conversion
    fx_to:'string', //i.e. converted to USD
    fx_spread:'float' //spread added on top
  },

  /** @type {string} product small image */
  thumbnail_url: 'string',

  /** @type {string} product larger image */
  main_image_url: 'string',

  options: [{
    type:'string', //color, size, etc.
    name:'string',
    original_name:{
      type:'string', //language locale, i.e. ko_KR 
      value:'string', //original text in ko_KR
      translate_src:'string', // source of translation (i.e. GC Translation API)
      translate_on:'date', //date of translation
      translate_to:'string' //i.e. translated to en-us locale 
    },
    description:'string',
    original_description:{
      type:'string', //language locale, i.e. ko_KR 
      value:'string', //original text in ko_KR
      translate_src:'string', // source of translation (i.e. GC Translation API)
      translate_on:'date', //date of translation
      translate_to:'string' //i.e. translated to en-us locale 
    },
    url:'string',
    product_id:'string',
    parent_id:'string',
    price_difference: 'float',
    price: 'float',
    original_price: {
      type:'string', //currency type, i.e. SKW  
      value:'float', //original value in SKW
      fx_rate:'float', // foreign exchange rate
      fx_rate_src:'string', //fx rate source, i.e. fixer.io
      fx_on:'date', //date of conversion
      fx_to:'string', //i.e. converted to USD
      fx_spread:'float' //spread added on top
    },
    thumbnail_url:'string',
    main_image_url:'string',
    available:'boolean',
    quantity_left:'number',
    selected:'boolean'
  }]
}