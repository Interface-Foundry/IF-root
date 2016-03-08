async = require 'async'
wm = require('walmart')(process.env.wmak)
_ = require 'lodash'

catIds = (cb) ->
  wm.taxonomy().then (tax) ->
    cb null, (category['id'] for category in tax['categories'])

bsthrottle = (catid, cb) ->
  setTimeout (-> wm.feeds.bestSellers(catid).then (ret) -> cb null, ret), 210


bestsellers = (cb) ->
  catIds (err, res) ->
    async.mapLimit res, 1, bsthrottle, (err, ret) ->
      cb err, (elem['items'] for elem in ret)


module.exports = bestsellers

if require.main is module
  bestsellers (err, res) ->
    console.log res
