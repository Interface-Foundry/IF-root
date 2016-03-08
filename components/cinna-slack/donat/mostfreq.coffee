_ = require 'lodash'
async = require 'async'
natural = require 'natural'
sqlite3 = require('sqlite3').verbose()
glob = require 'glob'
db = new sqlite3.Database(process.argv[2] or _.last(glob.sync('kiptest-*.db')))

async.auto
  tblcreate: (cb) ->
    console.log "Creating table qa_tbl"
    db.run 'create table errwords_tbl (word text, freq int, rate double);', ->
      cb null
  select: (cb) ->
    console.log 'Selecting queries'
    db.all 'select query, errorJSON from error_tbl', cb
  transform: ['select', (cb, ret) ->
    console.log 'Doing the computation'
    natural.PorterStemmer.attach()
    [good, errcausing] = _.partition (_.extend(row, {wordlist: _.uniq row['query'].tokenizeAndStem()}) for row in ret.select), ['errorJSON', 'null']
    cb null, (_.chain(row['wordlist'] for row in errcausing)
                    .flatten()
                    .countBy()
                    .toPairs()
                    .map((elem) ->
                      elem.concat elem[1] / (elem[1] + _.sum(1 for row in good when elem[0] in row['wordlist']))
                    )
                    .valueOf())
  ]
  persist: ['tblcreate', 'transform', (cb, ret) ->
    console.log 'Persisting word list'
    stmt = db.prepare "INSERT INTO errwords_tbl(word, freq, rate) VALUES ($word, $freq, $rate)", (err) ->
      return cb(err) if err
      async.map ret.transform, ((elem, cb) -> stmt.run({$word: elem[0], $freq: elem[1], $rate: elem[2]}, cb)), (err, ret) ->
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
