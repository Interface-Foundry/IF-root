app.directive('scheduleView', ['$location', function($location) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			
			scope.$watchCollection('schedule', function (newCollection, oldCollection, scope) {
				viewRender(newCollection);
			}) //view rerenders on changes to schedule
			
			var cache;
			
			function viewRender(newCollection) { //baby version of m.module, allows for rerenders outside watch
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
			} //maps first children of scheduleTree out, each goes through supergrouptemplate
			
			function superGroupTemplate(superGroup) { //template built once for each supergroup
				//{'title': [{group}, {group}]}
				var pair = _.pairs(superGroup)[0],
					// REMOVE AICP
					title = (pair[0] === 'Places' && $location.path().indexOf('aicp_2015') > -1) ? 'Speakers' : pair[0],
					groups = pair[1];		
				if (_.isEmpty(groups)) {
					return;
				} else {
					return m('section.bubble-supergroup', 
						{className: toggle[title] ? "closed" : ""}, //toggle logic stored here
						[m('button.bubble-supergroup-label',
						{onclick: toggleSuperGroup.bind(undefined, title)}, //toggle logic
						 title)].concat( //concatenate bc these elements are siblings to the label not children
						_.map(groups, groupTemplate))); //for each group in supergroup, build grouptemplate
				}
			}
			
			var toggle = {'Upcoming': false, 'Places': true, 'Previous': true}; //default toggle states
			
			function toggleSuperGroup(title) {
				toggle[title] = !toggle[title];	
				console.log(toggle, title);
				viewRender(); //rerender on toggle
			}
			
			function groupTemplate(group) { //built for each group in each supergroup
				//{'title': [landmarks...]}
				var pair = _.pairs(group)[0],
				// REMOVE AICP
					title = (pair[0] === 'Places' && $location.path().indexOf('aicp_2015') > -1) ? '' : pair[0],
					landmarks = (pair[0] === 'Places') ? _.sortBy(pair[1], 'name') : pair[1];
				
				return m('div.bubble-group', [
					m('header.bubble-group-label', title),
					m('ul.bubble-list', _.map(landmarks, landmarkTemplate)) //built for each landmark in each group
					]);
			}
			
			function landmarkTemplate(landmark) {
				return m('li.bubble-list-item', 
					m('a.bubble-list-item-link', {href: ifURL('#w/'+scope.world.id+'/'+landmark.id)}, //safe if hrefs for phonegap
						[m('img.bubble-list-item-img', {src: landmark.avatar}), 
						m('span.bubble-list-item-label.u-ellipsis', [landmark.name, m('small', landmark.category)]), 
						m('footer.bubble-list-item-detail', landmarkDetail(landmark)), 
						m('footer.bubble-list-item-room-info', landmarkRoomDetail(landmark))
					]));
			}
			
			function landmarkDetail(landmark) {
				return [
					m('span', landmark.time.start && (moment(landmark.time.start).format('ddd, MMM Do, hA')) + ' - '),
					m('span', landmark.time.end && (moment(landmark.time.end).format("ddd, MMM Do, hA")))
				]
			}
			
			function landmarkRoomDetail(landmark) {
				if (landmark.loc_info) {
					return floorsAndRooms(landmark.loc_info);
				} else {
					return [];
				}
			}

			function floorsAndRooms(landmarkLocInfo) {
				var template = [];
				if (landmarkLocInfo.floor_num) {
					template.push(m('span', 'Floor: '+landmarkLocInfo.floor_num));
				}
				if (landmarkLocInfo.room_name) {
					template.push(m('span', 'Room: '+landmarkLocInfo.room_name));
				}
				return template;
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
}]); 