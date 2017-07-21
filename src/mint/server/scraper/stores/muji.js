var url = require('url')

//scraper stuff
var fx_currency = require('../foreign_exchange')
var utils = require('../scrape_utils')

module.exports = async function (s, $) {
  //get product id
  s.product_id = await utils.urlValue(s.original_link,'detail',1)
  s.parent_id = s.product_id //use the same as product id for muji

  //get meta tags
  var meta = $('meta')
  var keys = Object.keys(meta)

  //get images
  keys.forEach(function(key){
    if (meta[key].attribs && meta[key].attribs.property) {
      if(meta[key].attribs.property === 'og:image'){
        //ogImage = meta[key].attribs.content
        s.thumbnail_url = meta[key].attribs.content
        s.main_image_url = meta[key].attribs.content
      }
    }
  })

  //get name and description from meta tags
  keys.forEach(function(key){
    if (meta[key].attribs && meta[key].attribs.name) {
        if (meta[key].attribs.name === 'keywords'){
          s.original_name.value = meta[key].attribs.content
        }else if (meta[key].attribs.name === 'description') {
          s.original_description.value = meta[key].attribs.content
        }
    }
  })

  //get price
  $('.price').each(function(i, elm) {
    if ($(this).text()){
      var p = $(this).text().trim().replace(/[^0-9.]/g, "") //locate price, remove other text
      s.original_price.value = parseFloat(p)
      return false
    }
  })

  //CHECK FOR SIZES
      console.log('SIZE STUFF')
  $('#size').find('dd').each(function(i, elm) {
    //did user select?
        // console.log('text:', $(this).text().trim())
    var selected
    if($(this).has('.current').attr('class')){
      selected = true
    }else {
      selected = false
    }

        //regex out non latin & numeric characters
        var sizeText = $(this).text().trim()//.replace(/[^0-9a-z]/gi, "")
        sizeText = sizeText.split('').map(c => c.charCodeAt())
        sizeText = sizeText.filter(function (code) {
          return (code >= 48 && code <= 57) || (code >= 65281 && code <= 65370)
          // digits, and full-width latin characters
        })
        sizeText = sizeText.map(code => String.fromCharCode(code))
        sizeText = sizeText.join('')

    s.options.push({
      type: 'size',
      original_name: {
        value: sizeText
      },
      selected: selected,
      available: true
    })
  })

  //CHECK FOR COLORS
  $('#color').find('dd').each(function(i, elm) {
    //did user select?
    var selected
    if($(this).has('.current').attr('class')){
      selected = true
    }else {
      selected = false
    }

    //item not available
    var available
    if($(this).attr('class') == 'out'){
      available = false
    }else {
      available = true
    }

    var text = $('img',this).attr('title')
    text = text.split('').map(c => c.charCodeAt())
    text = text.filter(function (code) {
      return code !== 215
      // cutting out those weird x's
    })
    text = text.map(code => String.fromCharCode(code))
    text = text.join('')


    s.options.push({
      type: 'color',
      original_name: {
        // value: $('img',this).attr('title') //get value inside img title in this
        value: text
      },
      thumbnail_url: $('img',this).attr('src'),
      main_image_url: $('img',this).attr('src'),
      selected: selected,
      available: available
    })
  })
  return s
}
