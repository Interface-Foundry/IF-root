app.controller('UserController', ['$scope', '$rootScope', '$http', '$location', '$route', '$routeParams', 'userManager', '$q', '$timeout', '$upload', 'Landmark', 'db', 'alertManager', '$interval', 'ifGlobals', 'userGrouping', function ($scope, $rootScope, $http, $location, $route, $routeParams, userManager, $q, $timeout, $upload, Landmark, db, alertManager, $interval, ifGlobals, userGrouping) {
	
angular.extend($rootScope, {loading: false});
$scope.fromMessages = false;
$scope.state = {};
$scope.subnav = {
	profile: ['me', 'contacts', 'history'],
	worlds: ['worlds', 'drafts', 'filter']
}


$scope.kinds = ifGlobals.kinds;

var saveTimer = null;
var alert = alertManager;

$scope.onAvatarSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.user.avatar = data;
		$rootScope.avatar = data;
		$scope.uploadFinished = true;
	});
}

function saveUser() {
	if ($scope.user) {
		userManager.saveUser($scope.user);
		alert.addAlert('success', 'Your contact info has been successfully saved!', true);
	} else {
		console.log('error');
	}
}

$scope.update = function(tab) {
	$scope.state.myProfile = $scope.subnav.profile.indexOf(tab) > -1 || !tab;
	$scope.state.myWorlds = $scope.subnav.worlds.indexOf(tab) > -1;
	$scope.state.profile = tab == 'me';
	$scope.state.contacts = tab == 'contacts';
	$scope.state.history = tab == 'history';
	$scope.state.worlds = tab == 'worlds';
	$scope.state.drafts = tab == 'drafts';
	
	$scope.state.template = 'components/user/templates/'+tab+'.html';
	if ($scope.state.myProfile) {$scope.menuLink = '/profile/me';}
	if ($scope.state.myWorlds) {$scope.menuLink = '/profile/worlds';}
	
	console.log($scope.state);
}


$scope.inspect = function(bubble) {
	if (bubble) {
		$scope.selected = bubble;
	} else {
		$scope.selected = false;
	}
}

$scope.inspectEvent = function(calEvent) {
	console.log('test');
	$scope.inspect(calEvent.bubble);
}

$scope.showCalendar = function() {
	if ($scope.calendarActive) {
		$scope.calendarActive = false;
	} else if ($scope.calendarLoaded) {
		$scope.calendarActive = true;
	} else {
		$scope.calendar = {events: userGrouping.groupForCalendar($scope.bubbles)}
		$scope.calendarLoaded = true;
		$scope.calendarActive = true;
	}	
}


$scope.calConfig = {
	// 	height: 360,
		eventClick: $scope.inspectEvent
}

////////////////////////////////////////////////////////////
/////////////////////////LISTENERS//////////////////////////
////////////////////////////////////////////////////////////
var lastRoute = $route.current;
$scope.$on('$locationChangeSuccess', function (event) {
    if (lastRoute.$$route.originalPath === $route.current.$$route.originalPath) {
        $scope.update($route.current.params.tab);
        $route.current = lastRoute;        
    }
});

$scope.$watchCollection('user', function (newCol, oldCol) {
	if (newCol != oldCol && oldCol!=undefined) {
		if (saveTimer) {
			$timeout.cancel(saveTimer);
		}
		saveTimer = $timeout(saveUser, 1000);
	}
});

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////


$scope.update($route.current.params.tab);

$scope.waitingforMeetup = false; //if from meetup, hide worlds until complete 

//if user login came from Meetup, then process new meetup worlds
if ($routeParams.incoming == 'meetup'){
	$scope.fromMeetup = true;
	$scope.waitingforMeetup = true;

	$http.post('/api/process_meetups').success(function(response){
		checkProfileUpdates(); //now wait until meetup bubbles come in
		// $http.get('/api/user/profile').success(function(user){
		// 	$scope.worlds = user;		
			
		// });
	}).
	error(function(data) {
		angular.extend($rootScope, {loading: false});
		$http.get('/api/user/profile').success(function(user){
			$scope.worlds = user;	
			$scope.waitingforMeetup = false;	
		});
	});
	
}
else if ($routeParams.incoming == 'messages'){
	$scope.fromMessages = true;
}
else {
	$http.get('/api/user/profile', {server: true}).success(function(user){
		console.log(user);
		
		//$scope.worlds = user;
		$scope.groups = userGrouping.groupByTime(user);
		console.log($scope.groups);
		
		$scope.bubbles = user;

		//sortWorlds(user);
	});
}

/*
function sortWorlds(user,incoming){


	switch(incoming) {
	    case 'meetup':

	        console.log('meetup');
	        break;

	    default:

	    	var eventBubbles = [];
	    	var eventBubblesFuzzy = [];
	    	var staticBubbles = [];
	    	var tempFuzzyTime;

	    	for (i = 0; i < user.length; i++) { 
	    		if(user[i].time.start){
	    			eventBubbles.push(user[i]);
	    		}
	    		else {
	    			staticBubbles.push(user[i]);
	    		}
	    	}

	    	if (eventBubbles.length > -1){
		    	//sort events descending
		    	eventBubbles.sort(function(a, b){
				    var d1 = new Date(a.time.start);
				    var d2 = new Date(b.time.start);
				    return d2-d1; // d2-d1 for ascending order
				});
			}

			if (staticBubbles.length > -1){
		    	//sort events descending
		    	staticBubbles.sort(function(a, b){
				    var d1 = new Date(a.time.created);
				    var d2 = new Date(b.time.created);
				    return d2-d1; // d2-d1 for ascending order
				});
			}

	    	for (i = 0; i < eventBubbles.length; i++) {

    			var MM = new Date(eventBubbles[i].time.start).getUTCMonth() + 1;
    			MM = MM.toString();
    			if (MM < 10){
    				MM = "0" + MM;
    			}
    			var DD = new Date(eventBubbles[i].time.start).getUTCDate();
    			DD = DD.toString();
    			if (DD < 10){
    				DD = "0" + DD;
    			}
    			var YY = new Date(eventBubbles[i].time.start).getUTCFullYear(); //get year of bubble event

    			var fuzzyTime = fuzzyTimeFormat(DD,MM,YY);

    			//new fuzzy group
    			if (tempFuzzyTime !== fuzzyTime){

	    			//get yesterday-ish date to display stuff sort of in future but a little past too
	    			var currentDate = new Date();
	    			currentDate.setDate(currentDate.getDate() - 1);

	    			//is date in the past-ish?
	    			if(new Date(eventBubbles[i].time.start) < currentDate){
						var fuzzyPast = true;
					}
					else{
						var fuzzyPast = false;
					}

    				var fuzzCat = {
    					fuzzyHeader: fuzzyTime,
    					fuzzyEvents: [eventBubbles[i]],
    					fuzzyPast: fuzzyPast
    				};

    				eventBubblesFuzzy.push(fuzzCat);
    				tempFuzzyTime = fuzzyTime;
    			}
    			//same fuzzy group
    			else {
    				eventBubblesFuzzy.filter(function ( obj ) {
					    if(obj.fuzzyHeader === fuzzyTime){
					    	obj.fuzzyEvents.push(eventBubbles[i]);
					    }
					})[0];
    			}

	    	}
	    	$scope.eventTimes = eventBubblesFuzzy;
	    	$scope.staticWorlds = staticBubbles;
	}
	

}
*/

//if came from meetup, keep checking for new meetups until route change
function checkProfileUpdates(){
	$scope.stop = $interval(checkProfile, 2000);

	function checkProfile(){
		$http.get('/api/user/profile').success(function(user){
		$scope.groups = userGrouping.groupByTime(user);
		console.log($scope.groups);
		
		$scope.bubbles = user;
			$scope.waitingforMeetup = false;	
			//$interval.cancel(checkProfile);
		});
	}
	//stops interval on route change
	var dereg = $rootScope.$on('$locationChangeSuccess', function() {
	    $interval.cancel($scope.stop);
	    dereg();
  	});

}

//showing "pretty" aka fuzzy time style dates
function fuzzyTimeFormat(DD,MM,YY) {
	//Fuzzy Time *~ - - - - ~ - - - ~ - - - ~ - - 
	//=========================================//
	/*
	 * JavaScript Pretty Date
	 * Copyright (c) 2011 John Resig (ejohn.org)
	 * Licensed under the MIT and GPL licenses.
	 */
	 //original code was modified

	// Takes an ISO time and returns a string representing how
	// long ago the date represents.
	function prettyDate(MMDDYY){
		var date = new Date((MMDDYY || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
			diff = (((new Date()).getTime() - date.getTime()) / 1000),
			day_diff = Math.floor(diff / 86400);
		if ( isNaN(day_diff) )
			return;	
		return day_diff == 0 && (
				diff < 60 && "just now" ||
				diff < 120 && "1 minute ago" ||
				//diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
				diff < 7200 && "1 hour ago" ||
				diff < 86400 && "Today") ||
			day_diff == -1 && "Tomorrow" ||
			day_diff == 1 && "Yesterday" ||	
			//future
			(day_diff > -7 && day_diff < -1) && day_diff + " days from now" ||  
			day_diff == -7 && "Next Week" ||  
			(day_diff > -14 && day_diff < -7) && "Next Week" ||
			(day_diff > -31 && day_diff < -14) && day_diff && Math.ceil( day_diff / -4 ) + " weeks from now" ||
			day_diff < -31 && Math.ceil( day_diff / -12) + " months from now" ||
			//past
			(day_diff < 7 && day_diff > 1) && day_diff + " days ago" ||
			day_diff == 7 && "Last Week" ||  
			(day_diff < 31 && day_diff > 7) && Math.ceil( day_diff / 7 ) + " weeks ago" ||
			day_diff > 31 && day_diff && Math.ceil( day_diff / 12 ) + " months ago";
	}
	//=========================================//
    return prettyDate(MM+'-'+DD+'-'+YY).toString().replace('-','');
}


$scope.deleteWorld = function(i) {
	var deleteConfirm = confirm("Are you sure you want to delete this?");
	if (deleteConfirm) {
		Landmark.del({_id: $scope.worlds[i]._id}, function(data) {
		//$location.path('/');
		console.log('##Delete##');
		console.log(data);
		$scope.worlds.splice(i, 1); //Removes from local array
	  });
	  }
  	}
  
$scope.deleteBubble = function(_id) {
	var deleteConfirm = confirm("Are you sure you want to delete this?");
	if (deleteConfirm) {
		Landmark.del({_id: _id}, function(data) {
		//$location.path('/');
		console.log('##Delete##');
		console.log(data);
		
		$route.reload();
		});
	 }
}

$scope.newWorld = function() {
	console.log('newWorld()');
	$scope.world = {};
	$scope.world.newStatus = true; //new
	db.worlds.create($scope.world, function(response){
		console.log('##Create##');
		console.log('response', response);
		$location.path('/edit/walkthrough/'+response[0].worldID);
	});
}

$scope.go = function(url) {
	$location.path(url);
}

$scope.goBack = function() {
	window.history.back();
}

userManager.getUser().then(
	function(response) {
	console.log('response', response);
	$scope.user = response;
}, function(reason) {
	console.log('reason', reason);
	$location.path('/');
	alert.addAlert('warning', "You're not logged in!", true);
})

}]);
