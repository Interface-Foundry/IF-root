var fx_currency = require('../foreign_exchange')

module.exports = async function (s, $) {
  s.original_name.value = $('#J_Title').find('h3').text()
  console.log('test', $('#J_Title').html())
  s.original_price.value = $('#J_PromoPriceNum').html()

  console.log('t h i n g : ', s)
  return s;
}
