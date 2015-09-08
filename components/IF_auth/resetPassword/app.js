var db = require('db');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');

// Use the same authentication as regular kip
//app.use('/', require('../../components/IF_auth/new_auth'));

// Use cookie session ids
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

// get the reset page
// will be something like https://kipapp.co/styles/resetpassword/peter.m.brandt@gmail.com/somereallylonganduniquetoken
app.get('/*', function(req, res, next) {
    res.sendfile(__dirname + '/resetPassword.html');
});

app.post('/reset', function (req, res, next) {
    console.log(req.body);
    res.send(200);
})

if (!module.parent) {
    app.listen(8081, function() {
        console.log('app listening on port 8081');
    })
} else {
    module.exports = app;
}