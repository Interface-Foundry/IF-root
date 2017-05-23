const co = require('co')

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

co(function * () {
  console.log('running')
  yield dbReady;
  var carts = yield db.Carts.find({}).populate('items');
  console.log('got carts')
  carts = carts.filter(function (c) {
    return !c.items.length;
  })
  console.log('EMPTY CARTS:', carts);
})
