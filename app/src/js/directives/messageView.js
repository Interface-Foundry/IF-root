app.directive('messageView', function() {
	return {
restrict: 'E',
link: function(scope, element, attrs) {
	
	scope.$watchCollection('messages', function (newCollection, oldCollection, scope) {
		m.render(element[0], newCollection.map(messageTemplate));
	})
	
	function messageTemplate(message) {
		return m('li.message',
			{key:message._id,
			class: message.userID===scope.userID ? 'message-self' : '',
			onclick: function(e) {scope.messageLink(message)}},
			[
				m('picture.message-avatar',
					m('img.small-avatar', {src:message.avatar || 'img/icons/profile.png'})),
				m('h6.message-heading', message.nick || 'Visitor'),
				messageContent(message)
			]);
	}
	
	function messageContent(message) {
		var content,
			kind = message.kind || 'text';
		switch (kind) {
			case 'text':
				content = m('.message-body', message.msg);
				break;
			case 'pic': 
				content = [
					m('img.img-responsive', {src:message.pic}),
					m('.message-body')
				];
				break;
			case 'sticker': 
				content = 	[m('.message-sticker-background', [
								m('img.message-sticker-img', {src: message.sticker.img}),
								m('img.message-sticker-link', {src: 'img/icons/ic_map_48px.svg'})
							]),
							m('.message-body', message.msg)]
				break;
			case 'editUser': 
				content = [
					m('.message-body', message.msg),
					m('hr.divider'),
					m('img.msg-chip-img', {src: scope.user.avatar}),
					m('.msg-chip-label', scope.nick),
					m('img.msg-chip-edit', {src: 'img/icons/ic_edit_grey600.png'})
				];
				break;
		}

		return m('.message-content', content);
	}


	
}
	}
}); 