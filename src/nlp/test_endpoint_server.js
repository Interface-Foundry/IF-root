var star = require('thunkify-wrap').genify;
var nlp = require('./api')
var parse = star(nlp.parse)
var koa = require('koa')
var app = koa()

app.use(require('koa-logger')())
app.use(require('koa-bodyparser')())

app.use(function *() {
  console.log(this.request.body)
  var query = this.request.body.text || '';
  this.body = yield parse(query);
  console.log(this.body)
  this.type = 'json'
})

app.listen(6000)
