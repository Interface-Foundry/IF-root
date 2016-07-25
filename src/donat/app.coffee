_ = require 'lodash'
async = require 'async'
sqlite3 = require('sqlite3').verbose()
request = require('request-json')

sentfuzzler = require './sentfuzzler.coffee'
amazoncrawl = require './amazoncrawl.coffee'
walmartcrawl = require './walmartcrawl.coffee'

db = new sqlite3.Database("kiptest-#{(new Date()).getTime()}.db")
sf = new sentfuzzler(limit: 30)
kipclient = request.createClient('http://chat.kipapp.co:6000')

cartesianProduct = -> _.reduce arguments, ((a,b) -> _.flatten(_.map(a,(x) -> _.map b, (y) -> x.concat(y)), true)), [[]]

amazonallchannels = ['bestsellers', 'most-gifted', 'most-wished-for', 'movers-and-shakers', 'new-releases']
amazonalltags = ['appliances', 'arts-crafts', 'automotive', 'baby-products', 'beauty', 'books', 'photo', 'apparel', 'coins', 'pc', 'electronics', 'entertainment-collectibles', 'gift-cards', 'grocery', 'hpc', 'home-garden', 'hi', 'industrial', 'jewelry', 'kitchen', 'magazines', 'movies-tv', 'music', 'musical-instruments', 'office-products', 'lawn-garden', 'pet-supplies', 'shoes', 'software', 'sporting-goods', 'sports-collectibles', 'toys-and-games', 'videogames', 'watches']
amazontags = amazonalltags
amazonchannels = amazonallchannels

async.auto
  amazon: (cb, res) ->
    console.log 'Getting items from Amazon'
    async.map cartesianProduct(amazonchannels, amazontags), amazoncrawl, (err, ret) -> # console.log 'Got items from Amazon'
      cb err, ret
  walmart: (cb, res) ->
    console.log 'Getting items from Walmart'
    walmartcrawl cb
  fuzz: ['amazon', 'walmart', (cb, res) ->
    console.log 'Fuzzing items'
    fuzzer = sf.fuzz.bind(sf)
    fuzzer = async.asyncify(_.identity)
    prodlist = (elem['puretitle'] for elem in _.flatten(res.amazon))
    prodlist = prodlist.concat (elem['name'] for elem in _.flatten(res.walmart))
    async.map prodlist, fuzzer, (err, ret) -> # console.log 'Fuzzed items'
      cb err, ret
  ]
  test: ['fuzz', (cb, res) ->
    console.log 'Testing items'
    async.mapLimit _.flatten(res.fuzz), 10, ((text, cb) -> kipclient.post '/', {text}, (e, r, b) -> cb null, {e, text, res: JSON.stringify b}), (err, ret) -> # console.log 'Tested items'
      cb err, ret
  ]
  dbpreperr: (cb, res) ->
    console.log "Creating table error_tbl"
    db.run "create table error_tbl (query text, errorJSON text)", cb
  dbprepprod: (cb, res) ->
    console.log "Creating table product_tbl"
    db.run "create table product_tbl (cat text, item text, asin text)", cb
  dbprepwmprod: (cb, res) ->
    console.log "Creating table wmproduct_tbl"
    db.run "create table wmproduct_tbl (item text, url text)", cb
  persistamazon: ['amazon', 'dbprepprod', (cb, res) ->
    console.log 'Persisting Amazon product list'
    stmt = db.prepare "INSERT INTO product_tbl(cat, item, asin) VALUES ($cat, $item, $asin)", (err) ->
      return cb(err) if err
      async.map _.flatten(res['amazon']), ((elem, cb) -> stmt.run({$cat: elem['tag'], $item: elem['puretitle'], $asin: elem['asin']}, cb)), (err, ret) ->
        return cb(err) if err
        stmt.finalize (err) ->
          cb err, ret
  ]
  persistwm: ['walmart', 'dbprepprod', (cb, res) ->
    console.log 'Persisting Walmart product list'
    stmt = db.prepare "INSERT INTO wmproduct_tbl(item, url) VALUES ($item, $url)", (err) ->
      return cb(err) if err
      async.map _.flatten(res['walmart']), ((elem, cb) -> stmt.run({$item: elem['name'], $url: elem['productUrl']}, cb)), (err, ret) ->
        return cb(err) if err
        stmt.finalize (err) ->
          cb err, ret
  ]
  persisterr: ['test', 'dbpreperr', (cb, res) ->
    console.log 'Persisting testReq list'
    stmt = db.prepare "INSERT INTO error_tbl(query, errorJSON) VALUES ($query, $errorJSON)", (err) ->
      return cb(err) if err
      async.map res['test'], ((elem, cb) -> stmt.run({$query: elem['text'], $errorJSON: JSON.stringify(elem['e'])}, cb)), (err, ret) ->
        return cb(err) if err
        stmt.finalize (err) ->
          cb err, ret
  ]
  dbclose: ['persistamazon', 'persisterr', 'persistwm', (cb, res) ->
    db.close cb
  ]
, (err, res) ->
  throw err if err
  console.log 'done'
  # console.log res
