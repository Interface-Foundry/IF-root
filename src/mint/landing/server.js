const express = require('express');
const app = express();
const path = require('path');
const urlencode = require('urlencode');

// const url = 'https://u1613970.ct.sendgrid.net/asm/?user_id=1613970&data=0IBER-so2FeCmhc_WRwByzABAk0OsKL3ICAzpEgdn2TFG4ubEwbC4oe0EaNYqOkua-K8rfjX9LIAZzDE2pmcygfNI7Ngw4nsBYG3PdLqXnZjEp2vzzGe8agN8j-igCdYnEGvH5qGALXcgqKL638PkXtoiiwLnSsjKz6Gt9oNPp8ycgY1lrs8SqI1AOfwItIJS6KvEulj9QTP5rDe1vbxIzC1HYlBAEwXIXYB4hrr0szAYHrxCy_VyFtXJ0HvXTmNsiIez1Dbh1eQ0DK-78lsU3BPuhwjYU5AcDmhcaK-2SP1YCpV34RRbgvQpQ9uLNjImc5FcS-KWsX5gs9vVzoNVqWeUgAUI6TyEaN2RkG2SSR4eO1cvPxZ9-F_3PBBbU4Krp3eRtz2wdGneZZD4owp6w==';

var landing = require('./landing');

app.use('/humble', function (req, res) {
  res.send('sit down');
});

// app.use('/landing', express.static(path.join(__dirname, 'public/landing.html')));

app.use('/landing', function (req, res) {
  // console.log('url:', req.query.url);
  var url = req.query.url;
  var data = req.query.data;
  url = url + '&data=' + data;
  console.log('url', url);
  res.send(landing(url));
});

app.listen(5000, () => {
  console.log('Listening energetically at port 5000');
});
