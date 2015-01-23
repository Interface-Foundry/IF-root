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
		var sortedSchedule = [];
		var schedule = _.groupBy(landmarks, function(landmark) {			
			if (!landmark.time.start) {return 'Places'}
			
			var t = moment(landmark.time.start),
				now = moment();
			
			if (t.isSame(now, 'day')) {
				return 'Today'
			} else if (t.isAfter(now)) {
				if (t.isSame(now.add(1, 'day'),  'day')) {
					return 'Tomorrow';
				} else if (t.isSame(now, 'week')) {
					return 'This Week';
				} else if (t.isBefore(now.add(2, 'week'))) {
					return 'Next Week';
				} else if (t.isSame(now, 'month')) {
					return 'This Month';	
				} else if (t.isBefore(now.add(2, 'month'))) {
					return 'Next Month'; 
				} else if (t.isSame(now, 'year')) {
					return 'This Year';
				} else {
					return 'Upcoming';
				}
			} else if (t.isBefore(now)) {
				if (t.isAfter(now.subtract(2, 'day'))) {
					return 'Yesterday';
				} else if (t.isAfter(now.subtract(1, 'week'))) {
					return 'Last Week';
				} else if (t.isAfter(now.subtract(1, 'month'))) {
					return 'Last Month';
				} else if (t.isAfter(now.subtract(1, 'year'))) {
					return 'Last Year';
				} else {
					return 'Past';
				}
			}	
		});
		console.log(schedule);
		_.each(schedule, function(value, key, list) {
			sortedSchedule[timeMap[key]] = {title: key, landmarks: value}
		})
	
		$scope.schedule = _.compact(sortedSchedule);
		console.log($scope.schedule);
	})

	
}])