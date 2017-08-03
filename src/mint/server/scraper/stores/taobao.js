var fx_currency = require('../foreign_exchange')

module.exports = async function (s, $) {
  s.original_name.value = $('#J_Title').find('h3').text()

  if ($('#J_PromoPrice').find('strong'.text())) {
    var price = $('#J_PromoPrice').find('strong').text()
    s.original_price.value = price.slice(1)
    console.log('found a promo price', price)
  }
  else {
    console.log('did not find a price; trying again')
    var price = $('#J_StrPrice').find('.tb-rmb-num').text()
    console.log('price:', price)
  }

  console.log('t h i n g : ', s)
  return s;
}
