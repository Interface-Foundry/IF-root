_ = require 'lodash'
async = require 'async'
sqlite3 = require('sqlite3').verbose()
glob = require 'glob'
db = new sqlite3.Database(process.argv[2] or _.last(glob.sync('kiptest-*.db')))
request = require 'request'
Bottleneck = require 'bottleneck'
limiter = new Bottleneck 1, 210

realurl = (a) ->
  decodeURIComponent(a.replace(/.*\?l=/, '')).replace(/\?.*/, '')


qaforitem = (item, cb) ->
  url = realurl(item['url']).replace(/.*\//, 'http://www.walmart.com/reviews/api/questions/')
  res = []
  crawlPage = (pagenum, cb) ->
    newurl = url + "?pageNumber=#{pagenum}"
    limiter.submit request.get, {url: newurl, json: true}, (e, r, b) ->
      if b['questionDetails']
        cb e, (_.extend(question, {url: newurl}) for question in b['questionDetails'])
      else
        cb e, []
  limiter.submit request.get, {url, json: true}, (e, r, b) ->
    if b['pagination'] and b['pagination']['pages']?.length
      async.map [2..b['pagination']['pages'].length], crawlPage, (err, ret) ->
        cb err, (_.extend(question, {url}) for question in b['questionDetails']).concat _.flatten(ret)
    else
      if b['questionDetails']
        cb e, (_.extend(question, {url}) for question in b['questionDetails'])
      else
        cb e, []


async.auto
  tblcreate: (cb) ->
    console.log "Creating table qa_tbl"
    db.run 'create table qa_tbl (product_url text, question text, upvotes int, downvotes int, answersJSON text);', ->
      cb null
  select: (cb) ->
    db.all 'select url from wmproduct_tbl', cb
  get: ['select', (cb, res) ->
    console.log 'Getting q&a'
    async.map res['select'], qaforitem, cb
  ]
  persist: ['get', 'tblcreate', (cb, res) ->
    console.log 'Persisting q&a'
    stmt = db.prepare "INSERT INTO qa_tbl(product_url, question, upvotes, downvotes, answersJSON) VALUES ($product_url, $question, $upvotes, $downvotes, $answersJSON)", (err) ->
      return cb(err) if err
      async.map _.flatten(res['get']), ((elem, cb) -> stmt.run({$product_url: elem['url'], $question: elem['questionSummary'], $upvotes: elem['positiveVoteCount'], $downvotes: elem['negativeVoteCount'], $answersJSON: JSON.stringify(elem['answers'])}, cb)), (err, ret) ->
        return cb(err) if err
        stmt.finalize (err) ->
          cb err, ret
  ]
  dbclose: ['persist', (cb) ->
    db.close cb
  ]
, (err, ret) ->
  throw err if err
  console.log 'done'
