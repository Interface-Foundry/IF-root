request = require 'request'
FeedParser = require 'feedparser'
_ = require 'lodash'

crawlForTag = ([channel, tag], cb) ->
  feedparser = new FeedParser()
  request("http://www.amazon.com/gp/rss/#{channel}/#{tag}").pipe(feedparser)
  lst = []
  feedparser.on 'readable', ->
    lst.push (_.extend item, {puretitle: item['title'].replace(/.*?: /, ''), asin: item['guid'].replace(/.*_/, ''), tag} while item = @read() when item['title'])...
  feedparser.on 'end', ->
    cb null, lst

module.exports = crawlForTag

if require.main is module
  crawlForTag ['bestsellers', 'wireless'], (err, res) ->
    console.log res
