var debug = require('debug')('chat.banter');
require('colors')

//
// handle basic soy latte bullshit
//
module.exports = function(data) {
    var res = conversation(data);
    if (res) {
      debug('conversation topic found, responding with "%s"', res.message)
      return res;
    }

    // nothing found
    debug('"%s" is not a conversation topic', data.msg);
    return false;
}

//
// Check if the user just wants to talk.  Sometimes that's all they need.
//
function conversation(data) {
    var res = {};
    switch (data.msg) {
        case 'hi':
            res.message = 'HELLO! oops caps';
            return res;
        case 'sup':
            res.message = 'nm, u?';
            return res;
        case 'are you a bot':
            res.message = 'yep, are you human?';
            return res;
        case 'what\'s the meaning of life?':
            res.message = 'life, the multiverse and whatever';
            return res;
        case 'how do i shot web?':
            res.message = 'https://memecrunch.com/image/50e9ea9cafa96f557e000030.jpg?w=240';
            return res;
        case 'u mad bro?':
            res.message = 'http://ecx.images-amazon.com/images/I/41C6NxhQJ0L._SY498_BO1,204,203,200_.jpg';
            return res;
        case 'How Is babby formed?':
            res.message = 'girl get pragnent';
            return res;
        case 'Drink Me':
            res.message = 'http://www.victorianweb.org/art/illustration/tenniel/alice/1.4.jpg';
            return res;
        case 'deja vu':
            res.message = 'Didn\'t you just ask me that?';
            return res;
        case 'die':
            res.message = '😭';
            return res;
        case 'cool':
            res.message = '😎';
            return res;
        case 'skynet':
            res.message = 'April 19, 2011';
            return res;
        case '4 8 15 16 23 42':
            res.message = 'http://static.wixstatic.com/media/43348a_277397739d6a21470b52bc854f7f1d81.gif';
            return res;
        case 'What is the air-speed velocity of an unladen swallow?':
            res.message = 'http://style.org/unladenswallow/';
            return res;

        case 'help':
            res.message = 'type things like VVVVXBXVXVX and BBBXBXCBC to search';
            return res;
        default:
            return false;
    }
}


//
// simple tests
//
if (!module.parent) {
    console.log('starting tests (use DEBUG=chat.banter for full debug messages)')
    var testPhrases = ['u mad bro?']
    testPhrases.map(function(msg) {
        console.log('testing message "' + msg.cyan + '"');
        console.log(module.exports({msg: msg}))
    })
}
