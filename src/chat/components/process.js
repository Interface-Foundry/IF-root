/*eslint-env es6*/

var async = require('async')
var request = require('request')
var fs = require('fs')
var querystring = require('querystring')
const vision = require('node-cloud-vision-api')
var nlp = require('../../nlp2/api')
var banter = require('./banter.js')
var googl = require('goo.gl')
var tag = kip.config.amazon[0].awsTag


if (process.env.NODE_ENV === 'development') {
  googl.setKey('AIzaSyCKGwgQNKQamepKkpjgb20JcMBW_v2xKes')
} else {
  googl.setKey('AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk')
}

var COUNTRY = {
  DEFAULT: ['.com'],
  US: ['.com'],
  CANADA: ['.ca'],
  UK: ['.co.uk'],
  AUSTRALIA: ['.com.au'],
  INDIA: ['.in'],
  JAPAN: ['co.jp'],
  FRANCE: ['.fr'],
  GERMANY: ['.de'],
  ITALY: ['.it'],
  NETHERLANDS: ['.nl'],
  SPAIN: ['.es'],
  IRELAND: ['.ie'],
  MEXICO: ['.com.mx'],
  BRAZIL: ['.com.br']
}

var swapAmazonTLD = function (url, user_id) {
  var user = db.Chatuser.findOne({
    id: user_id
  })
  if (COUNTRY.hasOwnProperty(user.country)) {
    return url.split('.com').join(COUNTRY[user_country])
  }else {
    return url
  }
}

var updateCountry = function (country, user_id) {
  co(function * () {
    var user = yield db.Chatuser.findOne({id: user_id}).exec()

    convo.chatuser.settings.last_call_alerts = true
    yield convo.chatuser.save()
  }).catch(function (e) {})

  var user = db.Chatuser.findOne({
    id: user_id
  })
  if (COUNTRY.hasOwnProperty(user.country)) {
    return url.split('.com').join(COUNTRY[user_country])
  }else {
    return url
  }
}

var urlShorten = function (data, callback2) {

  // single url for checkouts
  if (data.bucket == 'purchase' && data.action == 'checkout' || data.bucket == 'purchase' && data.action == 'save') {
    logging.debug('Mitsuprocess10: ', data)
    if (data.client_res) {
      // var replaceReferrer = data.client_res.replace('kipsearch-20','bubboorev-20'); //obscure use of API on bubboorev-20
      var url = data.client_res
      url = url.replace(/(%26|\&)associate-id(%3D|=)[^%]+/, '%26associate-id%3D' + tag)

      var escapeAmazon = querystring.escape(url)

      // request.get('https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl='+querystring.escape('http://kipbubble.com/product/'+escapeAmazon+'/id/'+data.source.id+'/pid/shoppingcart')+'&format=txt', function(err, res, body) {
      //   if(err){
      //     logging.debug('URL SHORTEN error ',err)
      //   }
      //   else {
      //     callback2(body)
      //   }
      // })

      if (data.source.origin == 'kik') {
        callback2('http://motorwaytoroswell.space/product/' + escapeAmazon + '/id/' + data.source.id + '/pid/shoppingcart')
      }else {
        googl.shorten('http://motorwaytoroswell.space/product/' + escapeAmazon + '/id/' + data.source.id + '/pid/shoppingcart')
          .then(function (shortUrl) {
            callback2(shortUrl)
          })
          .catch(function (err) {
            console.error(err.message)
            callback2()
          })
      }
    }else {
      logging.debug('error: client_res missing from urlShorten')
    }
  }
  // get all urls for new search
  else {
    var loopLame = [0, 1, 2] // lol
    var urlArr = []
    async.eachSeries(loopLame, function (i, callback) {
      if (data.amazon[i]) {
        // var replaceReferrer = data.amazon[i].DetailPageURL[0].replace('kipsearch-20','bubboorev-20'); //obscure use of API on bubboorev-20
        var url = data.amazon[i].DetailPageURL[0]
        logging.debug(url)
        url = url.replace(/(%26|\&)tag(%3D|=)[^%]+/, '%26tag%3D' + tag)
        logging.debug(url)
        var escapeAmazon = querystring.escape(url)

        if (data.source.origin == 'kik') {
          urlArr.push('http://motorwaytoroswell.space/product/' + escapeAmazon + '/id/' + data.source.id + '/pid/' + data.amazon[i].ASIN[0])
          callback()
        }else {
          googl.shorten('http://motorwaytoroswell.space/product/' + escapeAmazon + '/id/' + data.source.id + '/pid/' + data.amazon[i].ASIN[0])
            .then(function (shortUrl) {
              urlArr.push(shortUrl)
              callback()
            })
            .catch(function (err) {
              console.error(err.message)
              urlArr.push('http://kipthis.com')
              callback()
            })
        }
      }else {
        callback()
      }
    }, function done () {
      callback2(urlArr)
    })
  }
}

function getNumEmoji (data, number, callback) {
  var numEmoji
  switch (number) {
    case 1: // emoji #1
      if (data.source.origin == 'socket.io') {
        numEmoji = '<div class="number">➊</div>'
      }
      else if (data.flags && data.flags.email == true || data.source.origin == 'skype') {
        numEmoji = '1.'
      }
      else if (data.source.origin == 'slack' || data.source.origin == 'supervisor') {
        numEmoji = ':one:'
      }else {
        numEmoji = '1⃣'
      }
      break
    case 2: // emoji #2
      if (data.source.origin == 'socket.io') {
        numEmoji = '<div class="number">➋</div>'
      }
      else if (data.flags && data.flags.email == true || data.source.origin == 'skype') {
        numEmoji = '2.'
      }
      else if (data.source.origin == 'slack' || data.source.origin == 'supervisor') {
        numEmoji = ':two:'
      }else {
        numEmoji = '2⃣'
      }
      break
    case 3: // emoji #3
      if (data.source.origin == 'socket.io') {
        numEmoji = '<div class="number">➌</div>'
      }
      else if (data.flags && data.flags.email == true || data.source.origin == 'skype') {
        numEmoji = '3.'
      }
      else if (data.source.origin == 'slack' || data.source.origin == 'supervisor') {
        numEmoji = ':three:'
      }else {
        numEmoji = '3⃣'
      }
      break
  }
  callback(numEmoji)
}

var emoji = {
  1: { slack: ':one:', html: '<div class="number">①</div>', email: '1. ', skype: '1.'},
  2: { slack: ':two:', html: '<div class="number">②</div>', email: '2. ', skype: '2.' },
  3: { slack: ':three:', html: '<div class="number">③</div>', email: '3. ', skype: '3.' },
  4: { slack: ':four:', html: '<div class="number">④</div>', email: '4. ', skype: '4.' },
  5: { slack: ':five:', html: '<div class="number">⑤</div>', email: '5. ', skype: '5.' },
  6: { slack: ':six:', html: '<div class="number">⑥</div>', email: '6. ', skype: '6.' },
  7: { slack: ':seven:', html: '<div class="number">⑦</div>', email: '7. ', skype: '7.' },
  8: { slack: ':eight:', html: '<div class="number">⑧</div>', email: '8. ', skype: '8.' },
  9: { slack: ':nine:', html: '<div class="number">⑨</div>', email: '9. ', skype: '9.' },
  10: { slack: '10.', html: '<div class="number">⑩</div>', email: '10. ', skype: '10.' },
  11: { slack: '11.', html: '<div class="number">⑪</div>', email: '11. ', skype: '11.' },
  12: { slack: '12.', html: '<div class="number">⑫</div>', email: '12. ', skype: '12.' },
  13: { slack: '13.', html: '<div class="number">⑬</div>', email: '13. ', skype: '13.' },
  14: { slack: '14.', html: '<div class="number">⑭</div>', email: '14. ', skype: '14.' },
  15: { slack: '15.', html: '<div class="number">⑮</div>', email: '15. ', skype: '15.' },
  16: { slack: '16.', html: '<div class="number">⑯</div>', email: '16. ', skype: '16.' },
  17: { slack: '17.', html: '<div class="number">⑰</div>', email: '17. ', skype: '17.' },
  18: { slack: '18.', html: '<div class="number">⑱</div>', email: '18. ', skype: '18.' },
  19: { slack: '19.', html: '<div class="number">⑲</div>', email: '19. ', skype: '19.' },
  20: { slack: '20.', html: '<div class="number">⑳</div>', email: '20. ', skype: '20.' }

}

//
// Shortens a url for a cart object.  I'm not super sure about the id right now.
//
function getCartLink (url, cart_id) {
  url = url.replace(/(%26|\&)associate-id(%3D|=)[^%]+/, '%26associate-id%3D' + tag)
  logging.debug('CART IDDDDDDDDD ', url)

  return googl.shorten('http://motorwaytoroswell.space/product/' + querystring.escape(url) + '/id/' + cart_id + '/pid/shoppingcart')
}

//
// Shortens a url for an item in the view cart thing.
//
function getItemLink (url, user_id, item_id) {
  url = url.replace(/(%26|\&)tag(%3D|=)[^%]+/, '%26tag%3D' + tag)
  logging.debug('ITEM IDDDDDDDDD ', url)

  var url_swapped = swapAmazonTLD(url, user_id)
  return googl.shorten('http://motorwaytoroswell.space/product/' + querystring.escape(url_swapped) + '/id/' + user_id + '/pid/' + item_id)
}

//
// Downloads slack file and runs through google vision for image to text search
// Token: pass auth token for slack team to get private url
//
var imageSearch = function (data, token, callback) {
  if (data.file && data.file.url_private) {
    var options = {
      uri: data.file.url_private,
      followRedirect: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }

    var savePath = __dirname + '/temp_imgs/' + Math.random().toString(36).substring(7) + data.file.filetype

    request(options).pipe(fs.createWriteStream(savePath)).on('close', function () {

      // init with auth
      vision.init({auth: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

      // construct parameters
      const req = new vision.Request({
        image: new vision.Image(savePath),
        features: [
          new vision.Feature('TEXT_DETECTION', 5),
          new vision.Feature('LABEL_DETECTION', 5)
        ]
      })

      // send single request
      vision.annotate(req).then((res) => {
        // handling response
        logging.debug(JSON.stringify(res.responses))

        var searchTerms = []

        // //logo detection
        // if(res.responses && res.responses[0].logoAnnotations && res.responses[0].logoAnnotations[0]){
        //   searchTerms.push(res.responses[0].logoAnnotations[0].description)
        // }

        // //text detection
        if (res.responses && res.responses[0].textAnnotations && res.responses[0].textAnnotations[0]) { // only processing english, spanish, french right now
          if (res.responses[0].textAnnotations[0].locale == 'en' || res.responses[0].textAnnotations[0].locale == 'es' || res.responses[0].textAnnotations[0].locale == 'fr') {
            var textEx = res.responses[0].textAnnotations[0].description
            textEx = textEx.replace(/(\r\n|\n|\r)/gm, ' ') // remove line breaks
            textEx = textEx.replace(/[\u0250-\ue007]/g, ''); // remove non-latin characters
            textEx = textEx.replace(/^(.{30}[^\s]*).*/, '$1'); // limit # of words
            searchTerms.push(textEx)
          }
        }

        // label detection
        if (searchTerms.length < 1) {
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[0]) {
            searchTerms.push(res.responses[0].labelAnnotations[0].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[1]) {
            searchTerms.push(res.responses[0].labelAnnotations[1].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[2]) {
            searchTerms.push(res.responses[0].labelAnnotations[2].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[3]) {
            searchTerms.push(res.responses[0].labelAnnotations[3].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[4]) {
            searchTerms.push(res.responses[0].labelAnnotations[4].description)
          }
        }

        // check for search terms
        if (searchTerms.length > 0) {
          logging.debug(searchTerms)
          callback(Array.from(new Set(searchTerms)).join(' ')) // remove dupes and make into string on return
        }else {
          callback()
        }

        fs.unlinkSync(savePath) // remove temp image

      }, (e) => {
        logging.debug('Error: ', e)
        fs.unlinkSync(savePath) // remove temp image
        callback()
      })
    })
  }
  // passed in normal url
  else if (data) {
    var options = {
      uri: data
    }

    var savePath = __dirname + '/temp_imgs/' + Math.random().toString(36).substring(7) + '.png'

    request(options).pipe(fs.createWriteStream(savePath)).on('close', function () {

      // init with auth
      vision.init({auth: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

      // construct parameters
      const req = new vision.Request({
        image: new vision.Image(savePath),
        features: [
          new vision.Feature('TEXT_DETECTION', 5),
          new vision.Feature('LABEL_DETECTION', 5)
        ]
      })

      // send single request
      vision.annotate(req).then((res) => {
        // handling response
        logging.debug(JSON.stringify(res.responses))

        var searchTerms = []

        // //logo detection
        // if(res.responses && res.responses[0].logoAnnotations && res.responses[0].logoAnnotations[0]){
        //   searchTerms.push(res.responses[0].logoAnnotations[0].description)
        // }

        // //text detection
        if (res.responses && res.responses[0].textAnnotations && res.responses[0].textAnnotations[0]) { // only processing english, spanish, french right now
          if (res.responses[0].textAnnotations[0].locale == 'en' || res.responses[0].textAnnotations[0].locale == 'es' || res.responses[0].textAnnotations[0].locale == 'fr') {
            var textEx = res.responses[0].textAnnotations[0].description
            textEx = textEx.replace(/(\r\n|\n|\r)/gm, ' ') // remove line breaks
            textEx = textEx.replace(/[\u0250-\ue007]/g, ''); // remove non-latin characters
            textEx = textEx.replace(/^(.{30}[^\s]*).*/, '$1'); // limit # of words
            searchTerms.push(textEx)
          }
        }

        // label detection
        if (searchTerms.length < 1) {
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[0]) {
            searchTerms.push(res.responses[0].labelAnnotations[0].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[1]) {
            searchTerms.push(res.responses[0].labelAnnotations[1].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[2]) {
            searchTerms.push(res.responses[0].labelAnnotations[2].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[3]) {
            searchTerms.push(res.responses[0].labelAnnotations[3].description)
          }

          // lol this code is awful
          if (res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[4]) {
            searchTerms.push(res.responses[0].labelAnnotations[4].description)
          }
        }

        // check for search terms
        if (searchTerms.length > 0) {
          logging.debug(searchTerms)
          callback(Array.from(new Set(searchTerms)).join(' ')) // remove dupes and make into string on return
        }else {
          callback()
        }

        fs.unlinkSync(savePath) // remove temp image

      }, (e) => {
        logging.debug('Error: ', e)
        fs.unlinkSync(savePath) // remove temp image
        callback()
      })
    })
  }
  // else {
  //   console.error('error: no private url found')
  // }

}

// check if string contains a mode, then build kip object
// context here is for which conversation this modeHandle called from, i.e. from 'settings mode'
var modeHandle = function (input, context, callback) {

  // * * Checking if we should switch mode here
  var inputTxt = {msg: input.toLowerCase().trim()}

  banter.checkModes(inputTxt, context, function (mode, res) {
    logging.debug('MODE FROM BANTER.JS ', mode)
    logging.debug('RES FROM BANTER.JS ', res)

    // nothing found in canned
    if (!mode && !res) {
      // try for NLP parse
      nlp.parse(inputTxt, function (e, res) {
        if (e) {
          logging.debug('NLP error ', e)
          callback()
        }else {
          // build obj from NLP parse
          buildKipObject(res, function (rez) {
            // mode detected via NLP, which is only shopping mode for now
            if (rez.action && rez.action !== 'initial') {
              var obj = {
                mode: 'shopping',
                res: rez
              }
              obj.res.mode = 'shopping'; // ugh, whatev
              callback(obj)
            }else {
              callback()
            }
          })
        }
      })
    }
    // pass mode and res
    else if (mode) {
      var obj = {
        mode: mode
      }

      // standardize
      if (!res) {
        obj.res = mode
      }else {
        obj.res = res
      }

      callback(obj)
    }else {
      logging.debug('NO MODE FOUND!!!!! heres mode: ', mode)
      callback()
    }
  })
}

// //find mode to match incoming kip object
// function findMode(data,callback){
//     if(data.action && data.bucket){
//         switch(data.bucket){
//             case 'purchase':
//                 switch(data.action){
//                     case 'list':
//                         data.mode = 'viewcart'
//                     break
//                 }
//             break
//             case 'search':
//             break

//         }
//     }else {
//         console.error('Error: missing data.bucket or data.action in findMode()')
//     }
//     callback(data)
// }

// BUILDS KIP DATA OBJECT FROM NLP RESPONSES
var buildKipObject = function (res, callback) {

  // logging.debug('INCOMING BUILD KIP OBJ ',res)

  var data = {}

  if (res.supervisor && data.flags) {
    data.flags.toSupervisor = true
  }

  if (res.execute && res.execute.length > 0) {
    if (!res.execute[0].bucket) {
      res.execute[0].bucket = 'search'
    }
    if (!res.execute[0].action) {
      res.execute[0].execute[0].action = 'initial'
    }

    // - - - temp stuff to transfer nlp results to data object - - - //
    if (res.execute[0].bucket) {
      data.bucket = res.execute[0].bucket
    }
    if (res.execute[0].action) {
      data.action = res.execute[0].action
    }
    if (res.tokens) {
      data.tokens = res.tokens
    }
    if (res.searchSelect) {
      data.searchSelect = res.searchSelect
    }
    if (res.execute[0].dataModify) {
      data.dataModify = res.execute[0].dataModify
    }
    // - - - - end temp - - - - //

    callback(data)
  }
  else if (!res.bucket && !res.action && res.searchSelect && res.searchSelect.length > 0) {
    // IF got NLP that looks like { tokens: [ '1 but xo' ], execute: [], searchSelect: [ 1 ] }

    // looking for modifier search
    if (res.tokens && res.tokens[0].indexOf('but') > -1) {
      var modDetail = res.tokens[0].replace(res.searchSelect[0], '') // remove select num from string
      modDetail = modDetail.replace('but', '').trim()
      logging.debug('mod string ', modDetail)

      data.tokens = res.tokens
      data.searchSelect = res.searchSelect
      data.bucket = 'search'
      data.action = 'modify'
      data.dataModify = {
        type: 'genericDetail',
        val: [modDetail]
      }

      logging.debug('constructor ', data)

      callback(data)
    }else {
      data.tokens = res.tokens
      data.searchSelect = res.searchSelect
      data.bucket = 'search'
      data.action = 'initial'

      logging.debug('un struct ', data)

      callback(data)
    }
  }else {
    if (!res.bucket) {
      res.bucket = 'search'
    }
    if (!res.action) {
      res.action = 'initial'
    }

    // - - - temp stuff to transfer nlp results to data object - - - //
    if (res.bucket) {
      data.bucket = res.bucket
    }
    if (res.action) {
      data.action = res.action
    }
    if (res.tokens) {
      data.tokens = res.tokens
    }
    if (res.searchSelect) {
      data.searchSelect = res.searchSelect
    }
    if (res.dataModify) {
      data.dataModify = res.dataModify
    }
    // - - - - end temp - - - - //

    callback(data)
  }
}

// ///////// tools /////////////

// / exports
module.exports.urlShorten = urlShorten
module.exports.getNumEmoji = getNumEmoji
module.exports.getCartLink = getCartLink
module.exports.getItemLink = getItemLink
module.exports.emoji = emoji
module.exports.imageSearch = imageSearch
module.exports.buildKipObject = buildKipObject
module.exports.modeHandle = modeHandle
