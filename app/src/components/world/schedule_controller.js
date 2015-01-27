app.controller('ScheduleController', ['$scope', 'worldTree', '$routeParams', 'styleManager', function($scope, worldTree, $routeParams, styleManager) {
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
	
	worldTree.getWorld($routeParams.worldURL).then(function(data) {
		$scope.world = data.world;
		$scope.style = data.style;
		styleManager.navBG_color = $scope.style.navBG_color;

		return $scope.world._id;
	}).then(function(_id) {return worldTree.getLandmarks(_id)})
	.then(function(landmarks) {		
		var now = moment();
		var schedule = [];
		var superGroups = {
			'Upcoming': {},
			'Today': {},
			'Previous': {},
			'Places': {}
		}
		
		var groupOrderMap = {
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

		
		 /* [{'Upcoming': []},
						{'Today': []},
						{'Previous': []},
						{'Places': []}];
		/*	schedule = [{'Upcoming': [{'Tomorrow': Bubbles},
									...]
						},
						...] */
		
		_.each(landmarks, function(landmark, index, list) {
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
		
		var temp = _.each(superGroups, function(superGroup, superGroupKey, list) {
			if (superGroupKey!=="Places") {
			_.each(superGroup, function(group, groupKey, list) {
				list[groupKey] = _.sortBy(group, function(landmark) {
					moment(landmark.time.start).unix()
				});
			})
			}
			
			list[superGroupKey] = _.sortBy(
				_.map(superGroup, function(group, groupKey) {
					var temp = {};
					temp[groupKey]=group;
					return temp;
				}), function (group, index, list) {
					var key = _.keys(group)[0];
					return groupOrderMap[key];
				})
		});
		
		console.log(temp);
		
		$scope.schedule = [
			{'Upcoming': superGroups['Upcoming']},
			{'Today': superGroups['Today']},
			{'Places': superGroups['Places']},
			{'Previous': superGroups['Previous']}
		];
		
		console.log(schedule);
			
		function getSuperGroup(landmark) {
			var t;
			if (!landmark.time.start) {return 'Places'}
			
			t = moment(landmark.time.start);
			
			if (t.isSame(now, 'day')) {
				return 'Today';
			} else if (t.isAfter(now)) {
				return 'Upcoming';
			} else {
				return 'Previous';
			}
		}
		
		function getGroup(landmark, superGroup) {
			var t;
			switch (superGroup) {
				case 'Upcoming': 
					t = moment(landmark.time.start);
					if (t.isSame(moment().add(1, 'day'),  'day')) {
						return 'Tomorrow';
					} else if (t.isSame(now, 'week')) {
						return 'This Week';
					} else if (t.isBefore(moment().add(2, 'week'))) {
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
				case 'Today':
					return 'Today';
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
		
	})

	
}])