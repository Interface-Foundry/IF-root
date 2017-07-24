var utils = require('../scrape_utils')

module.exports = async function (s, $) {
  //get product id
  s.product_id = await utils.urlValue(s.original_link, 'goods', 1)

  //get images
  s.main_image_url = $('.figure').find('img').attr('src')

  //get description
  s.original_description.value = $('#description').text()

  //get name
  s.original_name.value = $('.name').text()

  //get price
  var price = $('#item-info').children().first().children().first().text()
  price = price.replace(/[^\d]/g, '')
  console.log('price:', price)
  s.original_price.value = price

  console.log('sssssS!', s)
  return s
}
