const co = require('co')
const request = require('request-promise')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

const deals = require('../deals/deals')

module.exports = function (router) {

  /**
   * TODO, etc
   */
  router.post('/incoming', (req, res) => co(function * () {
    console.log('got this in an email');
    console.log('no, a real email');
    console.log('req.from', req.from);
    res.sendStatus(200);
  }))
};
