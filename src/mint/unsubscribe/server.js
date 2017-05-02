const express = require('express');
const app = express();

var landing = require('./landing');

app.use('/landing', function (req, res) {
  // console.log('url:', req.query.url);
  var url = req.query.url;

  //the url sendgrid passes us in has its own query string
  //which express parses out alongside the url qs parameter
  //so we just add that back in
  var data = req.query.data;
  url = url + '&data=' + data;
  console.log('url', url);
  res.send(landing(url));
});

app.listen(5000, () => {
  console.log('Listening energetically at port 5000');
});
