#!/usr/bin/env node
var request = require('request')

request({
  url: 'http://localhost:8083/reload'
})

request({
  url: 'http://localhost:8083/parse',
  method: 'POST',
  json: true,
  body: {
    text: process.argv.slice(2).join(' ') || 'shorts near SoHo'
  }
}, function(e, r, b){
  if (e) { return console.log(e) }
  console.log(b)
  console.log(b.ss)
})
