var db, dbReady = require('../')
dbReady.then(_db => db = _db)

async function migrate() {
  console.log('connecting to database...')
  await dbReady;
  console.log('connected')
  console.log('starting migration')

  await db.Carts.update({
    store: /amazon/,
    store_locale: 'UK',
  }, {
    store: 'Amazon',
    store_locale: 'GB'
  })

  await db.Carts.update({
    store: /ypo/,
    store_locale: 'UK',
  }, {
    store: 'YPO',
    store_locale: 'GB'
  })

  await db.Carts.update({
    store_locale: 'US'
  }, {
    store: 'Amazon',
    store_locale: 'US'
  })

  await db.Carts.update({
    store_locale: 'CA'
  }, {
    store: 'Amazon',
    store_locale: 'CA'
  })

  await db.Items.update({
    store: 'amazon'
  }, {
    store: 'Amazon'
  })

  console.log('done')
  process.exit(0)
}

migrate()
