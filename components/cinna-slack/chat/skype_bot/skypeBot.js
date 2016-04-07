/*-----------------------------------------------------------------------------
A bot for managing a users to-do list.  See the README.md file for usage 
instructions.
-----------------------------------------------------------------------------*/

const restify = require('restify');
const skype = require('./node_modules/skype-sdk');
const builder = require('botbuilder');
const index = require('./dialogs/index')

// Initialize the BotService
const botService = new skype.BotService({
    messaging: {
        botId: "28:8941f9bb-716a-48b9-b526-5fbf0cf4380a",
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: 'kip',
        appSecret: 'ybawxFrA3DhEp4yyEUDYSk0'
    }
});

// Create bot and add dialogs
var bot = new builder.SkypeBot(botService);
bot.add('/', index);

// Setup Restify Server
const server = restify.createServer();
server.post('http://fc38f85c.ngrok.io/v1/chat', skype.messagingHandler(botService));
server.listen(process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
