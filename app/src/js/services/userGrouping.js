angular.module('tidepoolsServices')
    .factory('userGrouping', [
    	function() {
    	
var userGrouping = {
	
}

userGrouping.groupByTime = function (bubbles) {
	var groups = {
		places: {
			label: 'Places',
			bubbles: [],
			order: 10
		},
		today: {
			label: 'Today',
			bubbles:[],
			order: 6
		},
		thisWeek: {
			label: 'This Week',
			bubbles: [],
			order: 5
		},
		thisMonth: {
			label: 'This Month',
			bubbles: [],
			order: 4
		},
		nextMonths: {
			label: 'Next Few Months',
			bubbles: [],
			order: 3
		},
		thisYear: {
			label: 'This Year',
			bubbles: [],
			order: 2
		},
		future: { 
			label: 'Future',
			bubbles: [],
			order: 1
		},
		lastWeek: {
			label: 'Last Week',
			bubbles: [],
			order: 7
		},
		lastMonth: {
			label: 'Last Month',
			bubbles: [],
			order: 8
		},
		past: {
			label: 'Past',
			bubbles: [],
			order: 9
		}
	}, group, bubble, now = moment();

	for (var i = 0; i < bubbles.length; i++) {
		var bubble = bubbles[i], startTime;
		if (bubble.time.start) { 
			var startTime = moment(bubble.time.start); 
		} else {
			startTime = undefined;
		}
		console.log(startTime);
		
		if (!startTime) {
			groups.places.bubbles.push(bubble);
		} else if (startTime.isSame(now, 'day')) {
			groups.today.bubbles.push(bubble);
		} else if (startTime.isAfter(now)) {
			if (startTime.isSame(now, 'week')) {
				groups.thisWeek.bubbles.push(bubble);
			} else if (startTime.isSame(now, 'month')) {
				groups.thisMonth.bubbles.push(bubble);
			} else if (startTime.isBefore(now.add(3, 'months'))) {
				groups.nextMonths.bubbles.push(bubble);
			} else if (startTime.isSame(now, 'year')) {
				groups.thisYear.bubbles.push(bubble);
			} else {
				groups.future.bubbles.push(bubble);
			}
		} else if (startTime.isBefore(now)) {
			if (startTime.isAfter(now.subtract(1, 'week'))) {
				groups.lastWeek.bubbles.push(bubble);
			} else if (startTime.isAfter(now.subtract(1, 'month'))) {
				groups.lastMonth.bubbles.push(bubble);
			} else {
				groups.past.bubbles.push(bubble);
			}
		}
	}
	
	angular.forEach(groups, function(group, key, groups) {
		if (key == 'places') {
			//skip 
		} else if (group.bubbles.length > 1) {
			group.bubbles.sort(function(a, b) {
				if (moment(a.time.start).isBefore(b.time.start)) {
					return -1;
				} else {
					return 1; 
				}
			});
		}
	});
	
	var groupsArray = Object.keys(groups)
		.map(function(key) {return groups[key]}) //returns new array, properties > elements
		.filter(function(group) {return group.bubbles.length > 0}) //remove empty groups
		.sort(function(a, b) {return a.order-b.order}) //sorts 
	
	return groupsArray;
}


userGrouping.groupForCalendar = function (bubbles) {
	return bubbles.filter(function(bubble) {
		return bubble.time.start;
	})
	.map(function(bubble) {
		return {
			id: bubble._id,
			title: bubble.name,
			start: bubble.time.start,
			end: bubble.time.end,
			bubble: bubble
		}
	});
}

return userGrouping;

}]);