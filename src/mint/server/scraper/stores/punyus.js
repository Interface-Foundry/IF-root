var utils = require('../scrape_utils')

module.exports = async function (s, $) {
  logging.info('PUNYUS scraper function called')
  //get product id
  s.product_id = await utils.urlValue(s.original_link,'detail',1)
  s.parent_id = s.product_id

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

  logging.info('got images')

  s.original_name.value = $('.itemInfo').find('[itemprop=name]').text().trim()
  s.original_description.value = $('.itemInfo').find('[itemprop=description]').text().trim()

  var p = $('.price').text().trim().replace(/[^0-9.]/g, "")
  s.original_price.value = parseFloat(p)

  logging.info('time for colorlist')

  $('.sku_colorList').each(function(i, elm) {

    var available
    if($(this).hasClass('nonstock')){
      available = false
    }else {
      available = true
    }

    s.options.push({
      type: 'color',
      original_name: {
        value: $('.sku_title',this).text().trim()
      },
        thumbnail_url:$('img',this).attr('src'),
        main_image_url:$('img',this).attr('src'),
        option_id: i, //to keep track of parent options
      available: true,
      selected: false
    })

    //get sizes inside color options
    $('.axis_item',this).each(function(z, elm) {

      var available
      if($(this).hasClass('nonstock')){
        available = false
      }else {
        available = true
      }

      s.options.push({
        type: 'size',
        original_name: {
          value: $(this).text().trim().split('/')[0].trim()
        },
        parent_id: i, //to keep track of parent option
        available: available,
        selected: false
      })
    })
  })
  logging.info('return s', s)
  return s
}
