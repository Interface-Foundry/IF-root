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

  // //make the options
  // var options = []
  // $('#relativeItem').find('li').map(function (i, elem) {
  //   console.log('IS THIS correct?', $(this).html())
  //   if ($(this).find('a').first().attr('href') !== '#') {
  //     var op = {
  //       type: 'Options'
  //       original_name: {},
  //       original_price: {}
  //     }
  //     op.original_name.value = $(this).find('.name').text()
  //     op.original_price.value = $(this).find('.price').text().replace(/[^\d]/g, '')
  //     op.url = $(this).find('a').first().attr('href')
  //     options.push(op)
  //   }
  // })
  // s.options = options

  // console.log('sssssS!', s)
  return s
}
