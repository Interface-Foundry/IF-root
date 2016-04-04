# Getting started

Let's say you want to build an echo messaging bot.
 
## Requirements

If you don't have them, go to the official Node.js website and install the latest versions of:

* Node.js and package ecosystem npm

Both are available from the official page. 

## Configuration

Before you get started, make sure you register your bot. Also have ready your:
* Bot’s ID
* Application ID If you've forgotten it, you can find your Application's ID in Details in My Bots.
* Your Application Secret If you've misplaced your Application Secret, you'll have to generate a new one at Microsoft Applications. 

Create a directory for your bot and navigate to it:
```
> mkdir echo_bot
> cd echo_bot
```

Initialize an npm project:
```
> npm init
```

Install the dependencies:
```
> npm install --save restify
```
Download the Skype-SDK package skype-sdk.tar.gz and install it using npm:
```
> npm install --save ./skype-sdk.tar.gz
```

Update your package.json file to include the "engines" attribute:
```javascript
{
…
"engines": {
"node": ">=5.6.0"
},
…
}
```
 
## Create server.js

You need to create a server.js file to:
* Initialize the bot service
* Initialize your bot
* Run everything within a restify framework

Let's get started.
1. Import all the needed libraries:
 * The restify framework
 * The Skype SDK
2. Create new instances of:
 * The {@link BotService} class configured for messaging. Your APP_ID and APP_SECRET environment variables have OAuth credentials.
 * The restify server
3. Add an event handler for [new contacts]{@link BotService#event:contactAdded} and reply with welcome message (set “escape” flag to true in your [reply]{@link Bot#reply} call, to accept invalid characters in user’s display names).
4. Add a [personal message event handler]{@link BotService#event:personalMessage} to echo and reply to incoming messages (set “escape” flag to true in your [reply]{@link Bot#reply} call, to accept invalid characters in user’s message).
5. Configure one route for incoming events.
6. Use the Skype SDK middleware functions to pass requests to BotService.
 * POST to /v1/chat for incoming events

The code should look like this:
 
```javascript
const fs = require('fs');
const restify = require('restify');
const skype = require('skype-sdk');

const botService = new skype.BotService({
    messaging: {
        botId: '28:<bot’s id>',
        serverUrl : "https://apis.skype.com ",
        requestTimeout : 15000,
        appId: process.env.APP_ID,
        appSecret: process.env.APP_SECRET
    }
});

botService.on('contactAdded', (bot, data) => {
    bot.reply(`Hello ${data.fromDisplayName}!`, true);
});

botService.on('personalMessage', (bot, data) => {
    bot.reply(`Hey ${data.from}. Thank you for your message: "${data.content}".`, true);
});

const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
const port = process.env.PORT || 8080;
server.listen(port);
console.log('Listening for incoming requests on port ' + port); 
```

## Start the bot
Your bot is ready. Start it and test it locally:
```
> node server.js
```
Make sure you created environment variables:
* APP_ID With your application ID.
* APP_SECRET With your application secret for OAuth.
If you don't, your bot won't authenticate and won't be able to call into Skype services.

You can also create an environment variable PORT to change the default port 8080. 

Finally, if you want to see the debugging messages we added to the code, enter:
```
> set DEBUG=skype-sdk*
``` 

## Deployment to Azure 

Follow the [Create a Node.js web app in Azure App Service](https://azure.microsoft.com/en-us/documentation/articles/web-sites-nodejs-develop-deploy-mac/) article to create your Azure service and deploy it.
Go to Azure portal, “App Services”, select your service, “Settings”, “Application settings”, go to “App settings” section and add your environment variables APP_ID and APP_SECRET there. You can also set up the DEBUG variable.

Once your service is deployed to Azure you can start testing the bot with Skype.

If your service is running on Azure, you might want to ensure that you are getting requests really from Bot Platform and not from someone just pretending to be the messaging service. You can use middleware that was created for skype-sdk. Modify your server.js and add following lines after the creation of your server.
```javascript
const server = restify.createServer();
server.use(skype.ensureHttps(true));
server.use(skype.verifySkypeCert());
```

The first middleware, `skype.ensureHttps(true)` will redirect all requests to https endpoint. If you want to reject them, use `skype.ensureHttps(true, 404)` to reply with 404 Not Found.

The second middleware, `server.use(skype.verifySkypeCert())` will allow requests only from Bot Platform. To use it, you need to configure your Azure service to require client certificate. Follow https://azure.microsoft.com/en-gb/documentation/articles/app-service-web-configure-tls-mutual-auth/ to turn on this feature. 

## Escaping special characters in messages

If your bot fails to send messages, you may have to escape special characters in the content. The rules for replacing characters are:
* Replace & with `&amp;`
* Replace < with `&lt;`
* Replace > with `&gt;`

This is already done for you in the SDK, there is an `escape` argument in `send()` and `reply()` functions. Set it to true to escape your message.

## Testing with ngrok 

There are tools that can create a public url to your local webserver on your machine, e.g. [ngrok](https://ngrok.com/). We’ll show how you can test your bot running locally over skype.

You’ll need to download ngrok and modify your bot’s registration.

First step is to start ngrok on your machine and map it to a local http port:
```
> ngrok http 8000
```
This will create a new tunnel from a public url to [http://localhost:8000](http://localhost:8000) on your machine. After you start the command, you can see the status of the tunnel:
```
ngrok by @inconshreveable                                           (Ctrl+C to quit)
Tunnel Status       online
Update              update available (version 2.0.24, Ctrl-U to update)
Version             2.0.19/2.0.25
Web Interface       http://127.0.0.1:4040
Forwarding          http://78191649.ngrok.io -> localhost:8000
Forwarding          https://78191649.ngrok.io -> localhost:8000

Connections     ttl     opn     rt1     rt5     p50     p90
                0       0       0.00    0.00    0.00    0.00
```

Notice the “Forwarding” lines, in this case you can see that ngrok created two endpoints for us [http://78191649.ngrok.io](http://78191649.ngrok.io) and [https://78191649.ngrok.io](http://78191649.ngrok.io) for http and https traffic.

You will now need to configure your Bot to use these endpoints. Don’t forget to append your route when updating the messaging url, the new url should look like this: [https://78191649.ngrok.io/v1/chat](https://78191649.ngrok.io/v1/chat)

Now you can start your server locally
```
> node server.js
Listening for incoming requests on port 8000
```

And send messages to your bot over skype, they will be sent by Bot Platform to [https://78191649.ngrok.io/v1/chat](https://78191649.ngrok.io/v1/chat) and ngrok will forward them to your machine. You just need to keep ngrok running.
You will see each request logged in the ngrok’s tunnel status table:
```
HTTP Requests
-------------

POST /v1/chat                  100 Continue
POST /v1/chat                  201 Created
```
If you are done with testing, you can stop ngrok (Ctrl+C), your agent will stop working as there is nothing to forward the requests to your local server.

**Note**: Free version of ngrok will create a new unique url for you everytime you start it. That means you always need to go back and update the messaging url for your bot.

**Note**: When running locally with ngrok, you need to comment out the call to skype.ensureHttps(true), because your service is not running as https server. 