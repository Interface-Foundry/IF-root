app.directive('scheduleView', function() {
	return {
restrict: 'E',
link: function(scope, element, attrs) {
	
	scope.$watchCollection('schedule', function (newCollection, oldCollection, scope) {
		viewRender(newCollection);
	})
	
	var cache;
	
	function viewRender(newCollection) {
		if (newCollection) {
			m.render(element[0], scheduleTree(newCollection));	
			cache = newCollection;
		} else if (cache) {
			m.render(element[0], scheduleTree(cache));
		}
		
	}
	
	//schedule form is
	//{supergroup: [{group: []}, 
	//				{group: []}],
	//	supergroup...}
	
	
	//schedule tree form is
	//supergroup: (collapsed/uncollapsed) (future/today/past)
	//---ul.group (last year/this week/etc)
	//------li.item (landmark)
	
	function scheduleTree(schedule) {
		var scheduleTree = _.map(schedule, superGroupTemplate);
		return scheduleTree;
	}
	
	function superGroupTemplate(superGroup) {
		//{'title': [{group}, {group}]}
		var pair = _.pairs(superGroup)[0],
			title = pair[0],
			groups = pair[1];		
		if (_.isEmpty(groups)) {
			return;
		} else {
			return m('section.bubble-supergroup', 
				{className: toggle[title] ? "closed" : ""},
				[m('button.bubble-supergroup-label', 
				{onclick: toggleSuperGroup.bind(undefined, title)},
				 title)].concat(
				_.map(groups, groupTemplate)));
		}
	}
	
	var toggle = {'Upcoming': true, 'Places': true, 'Previous': true};
	
	function toggleSuperGroup(title) {
		toggle[title] = !toggle[title];	
		console.log(toggle, title);
		viewRender();
	}
	
	
	function groupTemplate(group) {
		//{'title': [landmarks...]}
		var pair = _.pairs(group)[0],
			title = pair[0],
			landmarks = pair[1];
		
		return m('div.bubble-group', [
			m('header.bubble-group-label', title),
			m('ul.bubble-list', _.map(landmarks, landmarkTemplate))
			]);
	}
	
	function landmarkTemplate(landmark) {
		return m('li.bubble-list-item', 
			m('a.bubble-list-item-link', {href: ifURL('#w/'+scope.world.id+'/'+landmark.id)},
				[m('img.bubble-list-item-img', {src: landmark.avatar}),
				m('span.bubble-list-item-label', [landmark.name, m('small', landmark.category)]),
				m('footer.bubble-list-item-detail', landmarkDetail(landmark)),
				m('footer.bubble-list-item-room-info', landmarkRoomDetail(landmark))
			]));
	}
	
	function landmarkDetail(landmark) {
		return [
			m('span', landmark.time.start && ('Starts ' + moment(landmark.time.start).format('ddd, MMM Do, hA'))),
			m('span', landmark.time.end && ('Ends ' + moment(landmark.time.end).format("ddd, MMM Do, hA")))
		]
	}
	
	function landmarkRoomDetail(landmark) {
		if (landmark.loc_info) {
			return [
				m('span', 'Floor: '+landmark.loc_info.floor_num),
				m('span', 'Room: '+landmark.loc_info.room_name)
			]
		} else {
			return []
		}
	}
	
	function ifURL(url) {
		//@IFDEF WEB
		var firstHash = url.indexOf('#');
		if (firstHash > -1) {
			return url.slice(0, firstHash) + url.slice(firstHash+1);
		} else {return url}
		//@ENDIF
		return url;
	}
}
	}
}); 