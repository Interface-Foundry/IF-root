var express = require('express')
var exec = require('child_process').exec;
var app = express()

app.get('/run', function(req, res) {
  console.log('running tests at ' + new Date());
  exec('mocha test.js -R doc', function(e, stdout, stderr) {
    // aggregate the html that will be rendered on the admin panel
    var response = '';

    if (e) {
      response += '<h1>ERROR:</h1>\n' + e.message +'\n' + e.trace;
      response += '<br>Make sure you have mocha installed on the target test machine (npm install -g mocha)'
    }


    if (stderr) {
      response += '<h1>ERROR:</h1>\n' + stderr;
    }

    response += stdout;

    res.send(response)
  })
})

app.listen(9999)
console.log('test runner listening on 9999')
