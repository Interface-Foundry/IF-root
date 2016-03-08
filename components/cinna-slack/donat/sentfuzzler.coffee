speak = require 'speakeasy-nlp'
natural = require 'natural'
_ = require 'lodash'
async = require 'async'
wordsList = require 'english3kdata'
WordNet = require 'node-wordnet'

wordnet = new WordNet()
words = (item['name'].toLowerCase() for item in wordsList.getAll() when item['name'])

cartesianProduct = -> _.reduce arguments, ((a,b) -> _.flatten(_.map(a,(x) -> _.map b, (y) -> x.concat(y)), true)), [[]]

class SynGen
  constructor: ({@limit, @shuffle}) ->
    @shuffle ?= _.identity
  synonyms: (word,  cb) ->
    return cb(null, [word.token]) if not word.gensyn
    wordnet.lookup word.token, (results) =>
      ret = @shuffle(_.uniq _.flatten(item['synonyms'] for item in results))[...@limit]
      cb null, (if ret.length is 0 then [word.token] else ret)
  preparer: (sentence) ->
    clsfy = speak.classify sentence
    #wordlist = clsfy['nouns'] # clsfy['adjectives'].concat clsfy['nouns'] # [clsfy['tokens'][0]]
    ret = ({token, gensyn: token.toLowerCase() in words} for token in clsfy['tokens']) # (/\w/.test(token) and token in wordlist)
    return ret
  fuzz: (sentence, cb) ->
    async.map @preparer(sentence), @synonyms.bind(@), (err, results) ->
      cb err, [sentence].concat (elem.join(' ') for elem in cartesianProduct (results)...)

module.exports = SynGen

if require.main is module
  sg = new SynGen limit: 1#, shuffle: _.shuffle
  sg.fuzz 'Samsung 32GB EVO Class 10 Micro SDHC Card with Adapter up to 48MB/s (MB-MP32DA/AM)', (err, res) -> #yellow submarine
    console.log res
