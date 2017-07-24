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
  s.original_price.value = $('.price').find('input').attr('value')

  return s
}
