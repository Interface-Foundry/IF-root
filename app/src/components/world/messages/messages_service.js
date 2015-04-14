'use strict';

app.factory('messagesService', messagesService);

messagesService.$inject = [];

function messagesService() {

	return {
		createProfileEditMessage: createProfileEditMessage,
		createWelcomeMessage: createWelcomeMessage
	};

	function createProfileEditMessage(world, nickName) {
		return {
			roomID: world._id,
			nick: 'KipBot',
			kind: 'editUser',
			msg: 'You\'re chatting as:',
			avatar: 'img/IF/kipbot_icon.png',
			userID: 'chatbot',
			_id: 'profileEditMessage',
			href: 'profile/me/messages'
		};
	}

	function createWelcomeMessage(world) {
		return {
	    roomID: world._id,
	    nick: 'KipBot',
	    kind: 'welcome',
	    msg: 'Hey there, this is a Bubble chat created just for '+world.name+'. Chat, share pictures & leave notes with others here!',
	    avatar: 'img/IF/kipbot_icon.png',
	    userID: 'chatbot',
	    _id: 'welcomeMessage'
		};
	}
}