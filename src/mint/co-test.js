var co = require('co')

co(function * () {
  var a = new Promise((r, j) => {
    r(10)
  })
  console.log(a instanceof Promise)
  console.log(Promise.toString())
  a = yield a
  console.log(a)
})
