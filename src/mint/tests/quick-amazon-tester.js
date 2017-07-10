const StoreFactory = require('../server/cart/StoreFactory')

const store = StoreFactory.GetStore({
  store: 'Amazon',
  store_locale: 'US'
})

async function test() {
  var result = await store.search({
    text: 'https://www.amazon.com/dp/B019NZ4H10?_encoding=UTF8&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&camp=2025&creative=386001&creativeASIN=B019NZ4H10&linkCode=xm2&showDetailTechData=1&tag=motorwaytoros-20#technical-data'
  })

  console.log(result)
}

test().catch(console.error.bind(console))
