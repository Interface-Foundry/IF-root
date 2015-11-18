var Bot = require('slackbots');
var natural = require('natural'),
stemmer = natural.PorterStemmer;

// create a bot
var settings = {
    token: 'xoxb-14750837121-mNbBQlJeJiONal2GAhk5scdU',
    name: 'cinna-1000'
};
var bot = new Bot(settings);

bot.on('start', function() {

    bot.on('message', function(data) {
	    // all ingoing events https://api.slack.com/rtm 
	    if (data.type == 'message' && data.username !== settings.name){ // checks if type is a message & not the bot talking to itself (data.username !== settings.name)
	    	incomingMessage(data);
	    }
	});

});






// detail of A (full pic zoom ---> send original AWS img link)
// go back to last results (last 3 results) 'back / go back' <--- last results
// 

var messageHistory = {};


function incomingMessage(data){

	var chatChannel = data.channel;

	var context; 

	if (!messageHistory[chatChannel]){ //new user, set up chat states
		messageHistory[chatChannel] = {};
		messageHistory[chatChannel].misc_chat = []; //random chats
		messageHistory[chatChannel].search = []; //search 
		messageHistory[chatChannel].finalized = []; //finalizing search and purchase
	}


	//USE NATURAL NPM FOR LOGISTICAL REGRESSION
	// stemmer.attach();
	// console.log(data.text.stem());



	//COMMAND CLASSIFIER HERE (sorts into main buckets) <---can use advanced method later
	//context is way to classify the command 
	context = 'search_forward_q';  //search_forward_a too

	// SEARCH BACKWARD:
	// go back to last search. i want #2 please
	// go back one step in history, get #2 from last search
	// return confirmation

	//search forward context
	if (context == 'search_forward_q'){

		//console.log(messageHistory[chatChannel].search.slice(-1)[0]);

		//searchState++;


		//* * * * * * * * * * * * * * * * 
		//FIND OUT WHICH CHOICE USER MADE
		//IF NO USER CHOICE, ASK TO CLARIFY (something like 1 + 2, less like 1, )
		//----> transfer above choices into weights. i.e. (less like 1 more like 2 == [ 1 : 0.3 , 2 : 0.7 , 3 : 0 ]) 

		var choiceFocus;
		var choiceContext; //more like, less like, more / less like, detail item, start over, undo

		//sort selection
		switch (true) {
		    case (data.text.indexOf("1") !=-1 && data.text.indexOf("2") !=-1 && data.text.indexOf("3") !=-1):  
		    	console.log('asdf');
		        choiceFocus = '1 2 3';
		        break;
		    case (data.text.indexOf("1") !=-1 && data.text.indexOf("2") !=-1):
		        choiceFocus = '1 2';
		        break;
		    case (data.text.indexOf("3") !=-1 && data.text.indexOf("2") !=-1):
		        choiceFocus = '2 3';
		        break;  
		    case (data.text.indexOf("1") !=-1):
		        choiceFocus = '1';
		        break;
		    case (data.text.indexOf("2") !=-1):
		        choiceFocus = '2';
		        break;
		    case (data.text.indexOf("3") !=-1):
		        choiceFocus = '3';
		        break;     	      
		    default:
		    	console.log('Didn\'t catch that. You can say things like "more 1" "more 1 less 2" "next" "see 1" ');
		        choiceFocus = '0" ';
		}

		// * * * * * * * * * * *
		//https://dzone.com/articles/using-natural-nlp-module
		//Logistic regression algorithm
		// TRAIN HERE TO SORT CONTEXT OF SEARCH ---> mapped directly to weight of each item in search


		// //sort selection context
		// switch (true) {
		//     case (data.text.indexOf("more") !=-1 && data.text.indexOf("less") !=-1 && data.text.indexOf("not") !=-1):  
		//         choiceFocus = '1 2 3';
		//         break;
		//     case (data.text.indexOf("1") !=-1 && data.text.indexOf("2") !=-1):
		//         choiceFocus = '1 2';
		//         break;
		//     case (data.text.indexOf("3") !=-1 && data.text.indexOf("2") !=-1):
		//         choiceFocus = '2 3';
		//         break;  
		//     case (data.text.indexOf("1") !=-1):
		//         choiceFocus = '1';
		//         break;
		//     case (data.text.indexOf("2") !=-1):
		//         choiceFocus = '2';
		//         break;
		//     case (data.text.indexOf("3") !=-1):
		//         choiceFocus = '3';
		//         break;     	      
		//     default:
		//     	console.log('Didn\'t catch that. You can say things like "more 1" "more 1 less 2" "next" "see 1" ');
		//         choiceFocus = 'Didn\'t catch that. You can say things like "more 1" "more 1 less 2" "next" "see 1" ';
		// }

		//console.log(messageHistory.search);

    	bot.postMessage(data.channel, choiceFocus, function(data) {});	


		//* * * * * * * * * * * * * * * * 
		//SEARCH FOR NEW ITEMS BASED ON WEIGHTS ABOVE
		//

		//* * **  **  ** * * * *
		// RECORD HISTORY 


		var searchState = 1;

		var botResponse = 'ok';

		// switch (true) {
		//     case (data.text.indexOf("h") !=-1):
		//         botRespond('hey, what item are you looking for?');
		//         break;
		//     case (data.text.indexOf("a bot") !=-1):
		//         botRespond('yes. i am a bot. i admit it openly.');
		//         break;
		//     case (data.text.indexOf("dress") !=-1):
		//         botRespond('what kind of dress');
		//         break;
		//     case (data.text.indexOf("hat") !=-1):
		//         botRespond('what kind of hat');
		//         break;
		//     case (data.text.indexOf("item") !=-1):
		//         botRespond('what kind of item');
		//         break;
		//     case (data.text.indexOf("help") !=-1):
		//         botRespond('i can\'t help you.');
		//         break;
		//     case (data.text.indexOf("ok") !=-1):
		//         botRespond('right');
		//         break;
		//     case (data.text.indexOf("sup") !=-1):
		//         botRespond('nm, u?');
		//         break;	        	      
		//     default:
		//     	botRespond('wah? sorry i\'m hard of hearing');
		// }

		//NLP PARSE SEARCH HERE TO FIND CLASSIFIER (linear regression?)


		//STORE CHAT IN HISTORY
		//RECORDING CHATS PER CHANNEL
		messageHistory[chatChannel].search.push({ 
			ts: data.ts, //timestamp
			user: data.user, //user id
			text: data.text, //message
			team: data.team, //team id
			context: context, //our first convo
			searchState: searchState,
			botResponse: botResponse
		});

		
	}
	






		// switch (context){
		// 	//move forward in search
		// 	case 'search_forward':
		// 	if (messageHistory[chatChannel].searchState){ //we've already started searching, move forward
		// 		messageHistory[chatChannel].searchState++;
		// 	}
		// 	else {
		// 		messageHistory[chatChannel].searchState = 1;
		// 	}		
		// 	break;

		// 	//move backward in search
		// 	case 'search_backward':
		// 	if (messageHistory[chatChannel].searchState && messageHistory[chatChannel].searchState !== 0){ //go back until 0
		// 		messageHistory[chatChannel].searchState--;
		// 	}		
		// 	else {
		// 		messageHistory[chatChannel].searchState = 0;
		// 	}
		// 	break;

		// 	//start search over
		// 	case 'clear':
		// 		messageHistory[chatChannel].searchState = 0;
		// 	break;
		// }








	


	//function storeChatRecord(data,context,searchState){



	//}




	// console.log(data.text);

	// switch (true) {
	//     case (data.text.indexOf("hi") !=-1):
	//         botRespond('hey, what item are you looking for?');
	//         break;
	//     case (data.text.indexOf("a bot") !=-1):
	//         botRespond('yes. i am a bot. i admit it openly.');
	//         break;
	//     case (data.text.indexOf("dress") !=-1):
	//         botRespond('what kind of dress');
	//         break;
	//     case (data.text.indexOf("hat") !=-1):
	//         botRespond('what kind of hat');
	//         break;
	//     case (data.text.indexOf("item") !=-1):
	//         botRespond('what kind of item');
	//         break;
	//     case (data.text.indexOf("help") !=-1):
	//         botRespond('i can\'t help you.');
	//         break;
	//     case (data.text.indexOf("ok") !=-1):
	//         botRespond('right');
	//         break;
	//     case (data.text.indexOf("sup") !=-1):
	//         botRespond('nm, u?');
	//         break;	        	      
	//     default:
	//     	botRespond('wah? sorry i\'m hard of hearing');
	// }

	// function botRespond(msg){

	//     var params = {
	//         icon_emoji: ':cat:'
	//     };

	//     bot.postMessage(data.channel, msg, params, function(data) {
	    	
	//     });			
	// }



}


