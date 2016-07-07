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
server.listen(process.env.port || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

//=========================================================
// Bots Dialogs
//=========================================================

// Install First Run middleware and dialog
bot.use(function (session, next) {
		console.log('dafuq1', session)

    if (!session.userData.firstRun) {
        // console.log('session: ',session)
        session.userData.firstRun = true;
        session.userData.io = {
            source: {
                'origin':'skype',
                'channel':session.message.from.address.toString(),
                'org':'skype',
                'id':'skype' + "_" + session.message.from.address.toString() //for retrieving chat history in node memory,
            },
            'msg': session.message.text
        }
        session.replaceDialog('/'); 
    } else {
        session.replaceDialog('/'); 
    }
});



bot.dialog('/', function (session) {
	console.log('dafuq')
    session.send("Hello World");
});
