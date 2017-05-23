var express = require('express')
var co = require('co')
var _ = require('lodash')

var router = express.Router();

router.get('/checkout', (req, res) => {
  console.log('rendering prototype')
  res.render('pages/prototype/global_direct_checkout')
})

module.exports = router
