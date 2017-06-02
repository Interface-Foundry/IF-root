/**
 * Converts a response from the amazon api to an item in our database. Does not add this item to cart.
 * @param  {json}    res response from amazon api, a totally what the fuck pile of jsonified xml data
 * @return {Promise<item>}     returns promise for a db.Item.
 */
function res2item(res) {
  return co(function * () {
    // make sure the response is okay
    if (_.get(res, 'Request.IsValid') !== 'True' || !res.Item) {
      throw new Error('Invalid response from amazon request ' + JSON.stringify(res))
    }

    // Shorthand for the amazon Item object
    const i = res.Item

    // Custom scraping TODO
    const price = getItemPrice(i)
    const rating = 0
    const nRatings = 0

    // Grab the images
    const imageSet = _.get(i, 'ImageSets.ImageSet[0]') || _.get(i, 'ImageSets.ImageSet') || {}
    const thumbnailMinSize = 50
    const imageKeys = ['SwatchImage', 'SmallImage', 'ThumbnailImage', 'TinyImage', 'MediumImage', 'LargeImage', 'HiResImage']
    var thumbnail = imageKeys.reduce((chosenImage, thisImage) => {

      // Do we have a small image available?
      if(i.SmallImage && i.SmallImage.URL) return i.SmallImage.URL

      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = imageSet[thisImage]
      if (!img) {
        return
      }

      // See if this image type is big enough for us
      if (parseInt(img.Height._) >= thumbnailMinSize && parseInt(img.Width._) >= thumbnailMinSize) {
        return img.URL
      }
    }, null)

    const mainImage = imageKeys.reverse().reduce((chosenImage, thisImage) => {

      // Do we have a large normal image available?
      if(i.LargeImage && i.LargeImage.URL) return i.LargeImage.URL

      // Do we have a medium image available?
      if(i.MediumImage && i.MediumImage.URL) return i.MediumImage.URL

      // If we have already found an image that is good enough, return it
      if (chosenImage) return chosenImage

      // See if this item has this image type
      var img = imageSet[thisImage]
      if (img) {
        return img.URL
      }
    }, null)

    // if no image was good enough to be a thumbnail, use the main image as the thumbnail
    if (!thumbnail) {

      // Do we have a medium image available?
      if(i.MediumImage && i.MediumImage.URL) return i.MediumImage.URL

      thumbnail = mainImage
    }

    // make sure db is ready
    yield dbReady

    // create a new item
    try {
      var item = yield db.Items.create({
        store: 'amazon',
        name: i.ItemAttributes.Title,
        asin: i.ASIN,
        description: i.ItemAttributes.Feature,
        price: price,
        thumbnail_url: thumbnail,
        main_image_url: mainImage,
        iframe_review_url: (i.CustomerReviews.HasReviews === 'true') ? i.CustomerReviews.IFrameURL : null
      })
    } catch (err) {
      logging.error(err);
      return null;
    }

    // create new item options
    // this part is really really hard
    if (res.Options) {
      // Make the current item's selected options easy to use
      var selectedItem = res.Options.filter(o => o.ASIN === item.asin)[0]
      var selectedOptions = {}
      var variationAttributes = selectedItem.VariationAttributes.VariationAttribute instanceof Array ? selectedItem.VariationAttributes.VariationAttribute : [selectedItem.VariationAttributes.VariationAttribute]
      variationAttributes.map(attr => {
        selectedOptions[attr.Name] = attr.Value
      })

      // make a list of all the options for all the option types
      var allOptions = {}  // hash where keys are dimension names, and values are options we've created already
      var alreadySavedOptions = yield db.ItemOptions.find({id: ''})
      var options = res.Options.map(o => {
        var variationAttributes = o.VariationAttributes.VariationAttribute instanceof Array ? o.VariationAttributes.VariationAttribute : [o.VariationAttributes.VariationAttribute]
        return variationAttributes.map(attr => {
          // make sure we can handle this option type
          if (!allOptions[attr.Name]) {
            allOptions[attr.Name] = []
          }

          // check if we've already created this option
          if (allOptions[attr.Name].includes(attr.Value)) {
            return
          } else {
            allOptions[attr.Name].push(attr.Value)
          }

          // create an option in the db
          return db.ItemOptions.create({
            type: attr.Name,
            name: attr.Value,
            description: o.ItemAttributes.Title,
            url: '',
            asin: o.ASIN,
            price_difference: null, // not defined for amazon
            thumbnail_url: o.SmallImage.URL,
            main_image_url: o.LargeImage.URL,
            available: true,
            selected: attr.Value === selectedOptions[attr.Name]
          })
        })
      })

      options = yield _.flatten(options).filter(Boolean)
      options.map(o => {
        item.options.add(o.id)
      })
      yield item.save()
    }

    // um let's just get the item fresh to make sure it's okay
    item = yield db.Items.findOne({id: item.id}).populate('options')

    return item
  })
}

module.exports = res2Item
