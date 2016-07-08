var restify = require('restify');
var builder = require('botbuilder');
//=========================================================
// Bot Setup
//=========================================================
  
// Create bot and setup server
var connector = new builder.ChatConnector({
    appId: '3940dbc8-d579-4f3a-89fa-e8112b2cdae7',
    appPassword: 'xegc1g5ZXaHiLmmhGuVHovj'
});
var bot = new builder.UniversalBot(connector);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.verifyBotFramework(), connector.listen());
server.listen(9000, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


bot.dialog('/', function (session) {
	console.log('dafuq')
    session.send("Hello World");
});
