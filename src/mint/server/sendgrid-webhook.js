const express = require('express');
const bodyParser = require('body-parser');

var router = express.Router();

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

//test route
router.get('/test', function (req, res) {
  console.log('my name is cupid valentino');
  res.send('my name is cupid valentino');
});

//route sg will post to
router.post('/', function (req, res) {
  console.log('POST to sg router');
  console.log('req.body', req.body);
  res.send('POST to sg router');
});

module.exports = router;
