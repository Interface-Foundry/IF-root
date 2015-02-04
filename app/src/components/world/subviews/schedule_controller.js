app.controller('ScheduleController', ['$scope', 'worldTree', '$routeParams', 'styleManager', '$window', '$location', function($scope, worldTree, $routeParams, styleManager, $window, $location) {
	$scope.schedule = [];
	var timeMap = {
		'Upcoming': 0,
		'This Year': 1,
		'Next Month': 2,
		'This Month': 3,
		'Next Week': 4,
		'This Week': 5,
		'Tomorrow': 6,
		'Today': 7,
		'Yesterday': 8,
		'Last Week': 9,
		'Last Month': 10,
		'Last Year': 11,
		'Past': 12,
		'Places': 13
	}
	
	$scope.showCalendar = function() {
		if ($scope.calendarActive) {
			$scope.calendarActive = false;
		} else {
			$scope.calendarActive = true;
			handleWindowResize();
		}
	}
	
	$scope.inspectLandmark = function(calEvent) {
		$location.path('w/'+$scope.world.id+'/'+calEvent.landmark.id)
	}


	$scope.calConfig = {
		height: 360,
		eventClick: $scope.inspectLandmark,
		defaultView: 'agendaWeek'
	}

	var handleWindowResize = _.throttle(function(e) {
		$scope.calConfig.height = windowEl.height()-116;
		if (windowEl.width() < 600) {
			$scope.calConfig.defaultView = 'agendaDay';
		} else {
			$scope.calConfig.defaultView = 'agendaWeek';
		}
	}, 100)

var windowEl = $($window);
windowEl.on('resize', handleWindowResize);
	
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color;

		return $scope.world._id;
	}).then(function(_id) {return worldTree.getLandmarks(_id)})
	.then(function(landmarks) {
		$scope.landmarks = landmarks;
		
		setUpCalendar(landmarks);
		setUpSchedule(landmarks);
	});
	
	function setUpCalendar(landmarks) {
		$scope.calendar = {
			events: landmarks.filter(function(landmark) {return landmark.time.start})
						.map(function(landmark) {
							return {
								id: landmark._id,
								title: landmark.name,
								start: moment(landmark.time.start),
								end: moment(landmark.time.end),
								landmark: landmark
							}
						})
		}
		//console.log($scope.calendar.events);
	}
	
	function setUpSchedule(landmarks) {	
		var now = moment();
		var schedule = [];
		var superGroups = {
			'Upcoming': {},
			'This Week': {},
			'Today': {},
			'Previous': {},
			'Places': {}
		}
		
		var groupOrderMap = {
			'Upcoming': 0,
			'This Year': 10,
			'Next Month': 20,
			'This Month': 30,
			'Next Week': 40,
			'This Week': 50,
			'6': 55,
			'5': 56,
			'4': 57,
			'3': 58,
			'2': 59,
			'1': 60,
			'Today': 70,
			'Yesterday': 80,
			'Last Week': 90,
			'Last Month': 100,
			'Last Year': 110,
			'Past': 120,
			'Places': 130
		}
		
		 /* [{'Upcoming': []},
						{'Today': []},
						{'Previous': []},
						{'Places': []}];
		/*	schedule = [{'Upcoming': [{'Tomorrow': Bubbles},
									...]
						},
						...] */
		
		_.each(landmarks, function(landmark, index, landmarks) {
			var superGroup = getSuperGroup(landmark);
			var group = getGroup(landmark, superGroup);
			
			if (superGroups[superGroup][group]) {
				superGroups[superGroup][group].push(landmark);
			} else {
				superGroups[superGroup][group] = [landmark];
			}
		});
		
		//current structure {'upcoming': {'group': [],}}
		//first 									^ sort these
		//then							^to array 
		//then 				^to array
		

		_.each(superGroups, function(superGroup, superGroupKey, superGroups) {
			if (superGroupKey!=="Places") {
			_.each(superGroup, function(group, groupKey, superGroup) {
				superGroup[groupKey] = _.sortBy(group, function(landmark) {
					moment(landmark.time.start).unix()
				});
			})
			}
			
			superGroups[superGroupKey] = 
				_.sortBy(
					_.map(superGroup, function(group, groupKey) {
						var temp = {};
						temp[groupKey]=group;
						return temp;
					}), function (group, index, list) {
						var key = _.keys(group)[0];
						return groupOrderMap[key];
				})
		})
		
		console.log('thisweek', superGroups['This Week']);
		
if (superGroups['This Week'].length > 0) {
			superGroups['This Week'] = _.map(superGroups['This Week'], function(group, index, superGroup) {
				var pair = _.pairs(group)[0], //["key", value]
					title = getThisWeekString(pair[0]),
					group = pair[1],
					thisWeek = {};
				thisWeek[title] = group;
				console.log(thisWeek);
				return thisWeek;
			})
		}

				
		$scope.schedule = [
			{'Upcoming': superGroups['Upcoming']},
			{'This Week': superGroups['This Week']},
			{'Today': superGroups['Today']},
			{'Places': superGroups['Places']},
			{'Previous': superGroups['Previous']}
		];
		
		console.log($scope.schedule);
					
		function getSuperGroup(landmark) {
			var t;
			if (!landmark.time.start) {return 'Places'}
			
			t = moment(landmark.time.start);

			if (t.isBefore(now)) {
				return 'Previous';
			} else if (t.isSame(now, 'day')) {
				return 'Today';
			} else if (t.isBefore(moment().add(7, 'days'))) {
				return 'This Week';
			} else {
				return 'Upcoming'
			}
		}
		
		function getGroup(landmark, superGroup) {
			var t;
			switch (superGroup) {
				case 'This Week':
					t = moment(landmark.time.start);
					if (t.isSame(now)) {
						return 0;
					} else if (t.isSame(moment().add(1, 'day'), 'day')) {
						return 1;
					} else if (t.isSame(moment().add(2, 'day'), 'day')) {
						return 2;
					} else if (t.isSame(moment().add(3, 'day'), 'day')) {
						return 3;
					} else if (t.isSame(moment().add(4, 'day'), 'day')) {
						return 4;
					} else if (t.isSame(moment().add(5, 'day'), 'day')) {
						return 5;
					} else if (t.isSame(moment().add(6, 'day'), 'day')) {
						return 6;
					}
					break;
				case 'Today': 
					return 'Today';
					break;
				case 'Upcoming': 
					t = moment(landmark.time.start);
					if (t.isBefore(moment().add(2, 'week'))) {
						return 'Next Week';
					} else if (t.isSame(now, 'month')) {
						return 'This Month';	
					} else if (t.isBefore(moment().add(2, 'month'))) {
						return 'Next Month'; 
					} else if (t.isSame(now, 'year')) {
						return 'This Year';
					} else {
						return 'Upcoming';
					}
					break;
				case 'Previous':
					t = moment(landmark.time.start);
					if (t.isAfter(moment().subtract(2, 'day'))) {
						return 'Yesterday';
					} else if (t.isAfter(moment().subtract(1, 'week'))) {
						return 'Last Week';
					} else if (t.isAfter(moment().subtract(1, 'month'))) {
						return 'Last Month';
					} else if (t.isAfter(moment().subtract(1, 'year'))) {
						return 'Last Year';
					} else {
						return 'Past';
					}	
					break;
				case 'Places':
					return 'Places';
					break;
			}
		}
		
		function getThisWeekString(key) {
			if (key == 1) {
				return 'Tomorrow';
			} else if (key == 2) {
				return moment().add(2, 'day').format('dddd, MMMM Do');
			} else if (key == 3) {
				return moment().add(3, 'day').format('dddd, MMMM Do');
			} else if (key == 4) {
				return moment().add(4, 'day').format('dddd, MMMM Do');
			} else if (key == 5) {
				return moment().add(5, 'day').format('dddd, MMMM Do');
			} else if (key == 6) {
				return moment().add(6, 'day').format('dddd, MMMM Do');
			} 
		}
	}

	
}])