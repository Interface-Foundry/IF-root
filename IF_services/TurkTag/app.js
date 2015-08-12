var db = require('db');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var job = require('job');

// Use the same authentication as regular kip
app.use('/', require('../../components/IF_auth/new_auth'));

app.use(cookieParser());

// get a page bitches
app.get('/', function(req, res, next) {
    if (!req.user) {
        // send login wall
        res.sendfile(__dirname + '/login.html');
    } else {
        // send a random page
        res.send('yay');
    }
});

app.listen(8081, function() {
    console.log('app listening on port 8081');
})

/**
 * Item process queue
 */
var nextItem;
job('item-turk-tag', function(data, done) {
    done();
});

/**
 * Gets an item that needs to be tagged from the process queue
 */
function getItem(cb) {

}