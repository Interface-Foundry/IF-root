const restify = require('restify');
const skype = require('skype-sdk');
const builder = require('botbuilder');

// Initialize the BotService
const botService = new skype.BotService({
    messaging: {
        botId: "28:kip",
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: 'kip',
        appSecret: 'ac55e0b47d0e4e939aab4bbe44ea942a'
    }
});

// Create bot and add dialogs
var bot = new builder.SkypeBot(botService);
bot.add('/', function (session) {
   session.send('Hello World'); 
});

// Setup Restify Server
const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
server.listen(process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});