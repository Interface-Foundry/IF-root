var db = require('db');
var Promise = require('bluebird');
var async = require('async');
var tagParser = require('../tagParser');
var _ = require('lodash');
var request = require('request')

db.EbayItems.find().limit(10).exec(function(err, items) {
    async.eachSeries(items, function iterator(item, finishedItem) {
        console.log('Item: ', item.itemId)
        console.log('\nOriginal tags: ', item.descriptionTags)
        item.descriptionTags = _.difference(item.descriptionTags, item.mainTags);
        var actualWords = []
        async.eachSeries(item.descriptionTags, function iterator(word, checkedWord) {
            checkWord(word).then(function(res) {
                var bool = res.isWord
                if (bool == 'true') {
                    actualWords.push(word)
                }
                checkedWord()
            })
        }, function checkedWords() {
            item.descriptionTags = actualWords;
            actualWords = tagParser.filter(actualWords).then(function(tags) {
                console.log('\nFiltered tags: ', tags)
                finishedItem()
            })
        })
    }, function finishedItems(err) {
        console.log('\n\n\n\ndone!\n\n\n\n\n\n')
    })
})


function checkWord(word) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://localhost:5000/check',
            body: word
        }
        request.post(options, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                body = JSON.parse(body)
                    // console.log('Result: ', body)
                resolve(body)
            } else {
                if (err) {
                    console.log('133', err)
                }
                resolve(body)
            }
        });
    })
}