var url = require('url')

module.exports = async function (s, $) {
  logging.info('waitrose')

  //get product id
  s.product_id = url.parse(s.original_link, true).query.productId

  //get product name
  s.name = $('h1').text().split('\n')[0].trim()

  //get product description
  s.description = $('.product-info').children('p').text()
  // console.log('d e s c r i p t i o n', description)

  //get images
  s.thumbnail_url = 'http:' + $('img').filter('.main-image').attr('src')
  s.main_image_url = 'http:' + $('.magnify').attr('href')

  //get price
  var price = $('.l-content').find('.price').find('strong').text().trim()
  // s.original_price.value
  console.log("price, price.length", price, price.length)
  if (price[price.length-1] === 'p') {
    console.log('price in pence')
    console.log('new price', price)
    price = price.slice(0, price.length-1) / 100
  }
  else {
    price = price.slice(1)
    console.log('new price', price)
  }
  s.original_price.value = price
  return s
}
