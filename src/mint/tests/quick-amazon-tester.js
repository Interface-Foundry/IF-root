const StoreFactory = require('../server/cart/StoreFactory')

const store = StoreFactory.GetStore({
  store: 'Amazon',
  store_locale: 'US'
})

async function test() {
  var result = await store.search({
    text: 'B01N4WYOE3'
    //text: 'https://www.amazon.com/Wrangler-Authentics-Sleeve-Classic-Rivera/dp/B01N3CRX2T/ref=sr_1_15?s=apparel&ie=UTF8&qid=1497472759&sr=1-15&nodeID=7141123011&psd=1&keywords=shirts'
  })

  console.log(result)
}

test().catch(console.error.bind(console))
