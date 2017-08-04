var fx_currency = require('../foreign_exchange')
var url = require('url')

module.exports = async function (s, $) {

  //get product id
  var parsed = url.parse(s.original_link, true)
  if(parsed.query && parsed.query.id){
    s.product_id = parsed.query.id
    s.parent_id = parsed.query.id
  }

  //get item name
  console.log('taobao called')
  s.original_name.value = $('#J_Title').find('h3').text().trim()
  console.log('original name', s)

  //get item price
  if ($('#J_PromoPrice').find('strong').text()) {
    console.log('found a promo price')

    var price = $('#J_PromoPrice').find('strong').text()
    s.original_price.value = price.slice(1)
  }
  else {
    console.log('did not find a promo price')
    console.log('did not find a price; trying again')
    console.log($('#J_StrPrice').html())
    var price = $('#J_StrPrice').find('.tb-rmb-num').text()
    s.original_price.value = price
    console.log('price:', price)
  }

  //get item description, if there is one
  if ($('.tb-subtitle')) {
    s.original_description.value = $('.tb-subtitle').text().trim()
  }

  //get main image
  if ($('.tb-main-pic')) {
    s.main_image_url = $('.tb-main-pic').find('img').attr('src')
  }

  //get smaller image
  if ($('#J_UlThumb')) {
    s.thumbnail_url = $('J_UlThumb').find('li').attr('data-index', '1').find('img').attr('src')
  }

  console.log('t h i n g : ', s)
  return s;
}
