var url = require('url')
var fx_currency = require('../foreign_exchange')
var utils = require('../scrape_utils')

module.exports = async function (s, $, processChildOptions, html) {
  //get product id
  var parsed = url.parse(s.original_link, true)
  if(parsed.query && parsed.query.goods_no){
    s.product_id = parsed.query.goods_no
    s.parent_id = parsed.query.goods_no
  }

  //name
  if($('.group_tit').text().trim()){
    s.original_name.value = $('.group_tit').text().trim()
  }else if($('.pname').text().trim()){
    s.original_name.value = $('.pname').text().trim()
  }

  //descrip
  s.original_description.value = $('.md_tip').text().trim()

  //price
  if($('.after_price').text()){
    var p = $('.after_price').text().trim().replace(/[^0-9.]/g, "")
  }else if($('.big').text()){
    var p = $('.big').text().trim().replace(/[^0-9.]/g, "")
  }

  if(p){
    s.original_price.value = parseFloat(p)
  }


  //image URL
  if($('img','#fePrdImg01').attr('src')){
      s.thumbnail_url = $('img','#fePrdImg01').attr('src')
      s.main_image_url = $('img','#fePrdImg01').attr('src')
  }else if ($('img','#prdImg').attr('src')){
      s.thumbnail_url = $('img','#prdImg').attr('src')
      s.main_image_url = $('img','#prdImg').attr('src')
  }

  //get options type #1
  if($('.opt_sel a').length > 0){
    $('.opt_sel a').each(function(i, elm) {
      s.options.push({
        type: 'style', //style = top level option
        original_name: {
          value: $(this).text().trim()
        },
          product_id: $(this).attr('goods_no'),
          available: true //it's avail because it has a "loadurl" attribute in a href
      })
    })
    console.log(s)
    return s
  }

  //get options type #2

  //html queries to do for options
  var optionQ = []

  $('.c_list li').each(function(i, elm) {

    var opt_url = $('a',this).attr('loadurl') //url to get sub options for this options
    var name = $('.sec01',this).text().trim() //name
    var price = $('.sec02',this).text().trim().replace(/[^0-9.]/g, "") // price
    var product_id = $('a',this).attr('goodsno') //product id for this option
    var img = $('img',this).attr('src') //option image
    img = img.replace('_60','_150') //make option images larger (150px instead of 60px)

    //only process options that are still available
    if(opt_url){
      optionQ.push({
        opt_url: 'http://www.lotte.com'+opt_url,
        type: 'style', //style = top level option
        original_name: {
          value: name
        },
        original_price: {
          value: price
        },
          thumbnail_url:img,
          main_image_url:img,
          product_id: product_id,
          available: true //it's avail because it has a "loadurl" attribute in a href
      })
    }
  })

  //srape all product option URLs checking for suboptions ~
  var htmlQ = []
  for (i = 0; i < optionQ.length; i++) {
    htmlQ.push(utils.scrapeURL(optionQ[i].opt_url))
  }
  var results = await Promise.all(htmlQ)

  //check html for child options
  var optionResults = []
  var rates = await fx_currency.getRates()
  for (i = 0; i < optionQ.length; i++) {
    optionResults.push(processChildOptions(s,optionQ[i],results[i],rates))
  }

  //wait for all options to finish
  var options = await Promise.all(optionResults)

  s.options = [].concat.apply([], options) //condense into on obj array

  return s
}
