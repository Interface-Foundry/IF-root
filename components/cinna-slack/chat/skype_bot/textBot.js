/*-----------------------------------------------------------------------------
A bot for managing a users to-do list.  See the README.md file for usage 
instructions.
-----------------------------------------------------------------------------*/

const builder = require('botbuilder');
var index = require('./dialogs/index')

var textBot = new builder.TextBot();
textBot.add('/', index);

textBot.listenStdin();
