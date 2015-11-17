var Bot = require('slackbots');

// create a bot
var settings = {
    token: 'xoxb-14750837121-mNbBQlJeJiONal2GAhk5scdU',
    name: 'cinna-1000'
};
var bot = new Bot(settings);

bot.on('start', function() {

    var params = {
        icon_emoji: ':cat:'
    };

    bot.on('message', function(data) {
	    // all ingoing events https://api.slack.com/rtm 
	    console.log('init ',data);

	    // bot.postMessageToUser('alyx', 'hi', params, function(data) {
	    // 	console.log('res? ',data);
	    // });


	});




	// bot.postMessageToUser('alyx', 'hi', params).then(function(data) {

	// 	console.log('data ',data);
	//     // ... 
	// })

});


// 1
// 2
// 3





// detail of A (full pic zoom ---> send original AWS img link)
// go back to last results (last 3 results) 'back / go back' <--- last results
// 