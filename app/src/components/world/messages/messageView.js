app.directive('messageView', function() {
	return {
restrict: 'E',
link: function(scope, element, attrs) {
	
	scope.$watchCollection('messages', function (newCollection, oldCollection, scope) {
		m.render(element[0], newCollection.map(messageTemplate));
	})
	//rerenders whenever messages changes using mithril js
	
	function messageTemplate(message) { //each message object is passed to this function
		return m('li.message',
			{key:message._id, 
			class: message.userID===scope.userID ? 'message-self' : '', //message-self designates a message sent by user
			onclick: function(e) {scope.messageLink(message)}}, //for stickers currently
			[
				m('picture.message-avatar',
					m('img.small-avatar', {src: bubUrl(message.avatar) || 'img/icons/profile.png'})),
				m('h6.message-heading', message.nick || 'Visitor'),
				messageContent(message) //message object passed to next function to switch content templates
			]);
	}
	
	function messageContent(message) { //content template switches based on message kind
		var content,
			kind = message.kind || 'text';
		switch (kind) {
			case 'text':
				content = m('.message-body', message.msg);
				break;
			case 'pic': 
				content = [
					m('img.img-responsive', {src:message.pic, onload: imageLoad}),
					m('.message-body')
				];
				break;
			case 'sticker': 
				content =	[m('.message-sticker-background.u-pointer', [
								m('img.message-sticker-img', {src: message.sticker.img}),
								m('img.message-sticker-link', {src: 'img/icons/ic_map_48px.svg'})
							]),
							m('.message-body', message.msg)]
				break;
			case 'editUser': 
				content = [
					m('.message-body.kipbot-chat.u-pointer', message.msg),
					m('hr.divider.u-pointer'),
					m('img.msg-chip-img.u-pointer', {src: bubUrl(scope.user.avatar)}),
					m('.msg-chip-label.u-pointer', scope.nick),
					m('hr.divider.chat.u-pointer'),
					m('.message-body.kipbot-chat.u-pointer', 
						[
							m('img.msg-chip-edit', {src: 'img/icons/ic_edit_grey600.png'}),
							m('', 'Edit my profile')
						])
				];
				break;
			case 'welcome':
				content = m('.message-body.kipbot-chat', message.msg);
				break;
		}

		return m('.message-content', content); //end of message building process
	}

	function bubUrl(string) { //some urls don't have an absolute path which will break on iOS
		if (string === undefined) {
			return '';	
		}
		if (string.indexOf('http') > -1 || string.indexOf('img/IF/kipbot_icon.png') > -1) {
			return string;
		} else {
			return 'https://bubbl.li/'+string;
		}
	}
	
	function imageLoad() { //current method to keep scroll at bottom when a message is posted. Could be improved
		element[0].scrollTop = element[0].scrollTop + this.offsetHeight;
	}
	
}
	}
}); 