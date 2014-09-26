function WalkthroughController($scope, $location, $route, $routeParams, $http, $timeout, ifGlobals, leafletData, $upload, mapManager, World, db) {

////////////////////////////////////////////////////////////
///////////////////INITIALIZING VARIABLES///////////////////
////////////////////////////////////////////////////////////
$scope.global = ifGlobals;
$scope.world = {};
$scope.world.time = {};
$scope.world.time.start = new Date();
$scope.world.time.end = new Date();
$scope.world.style = {};
$scope.world.style.maps = {};
$scope.temp = {};
var map = mapManager;
var zoomControl = angular.element('.leaflet-bottom.leaflet-left')[0];

zoomControl.style.display = 'none'; 

$scope.next = function() {
	if ($scope.position < $scope.walk.length-1) {
		$scope.position++; 
		//check if new position has 'jump'
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.next();
			}
		}
	}
	$scope.save();
}

$scope.prev = function() {
	if ($scope.position > 0) {
		$scope.position--;
		if ($scope.walk[$scope.position].hasOwnProperty('jump')) {
			if ($scope.walk[$scope.position].jump()) {
				$scope.prev();
			}
		}
	}
	$scope.save();
}

$scope.slowNext = function() {
	$timeout(function() {
		$scope.next();
	}, 200);
	$scope.save();
}

$scope.pictureSelect = function($files) {
	var file = $files[0];
	$scope.upload = $upload.upload({
		url: '/api/upload/',
		file: file,
	}).progress(function(e) {
		console.log('%' + parseInt(100.0 * e.loaded/e.total));
	}).success(function(data, status, headers, config) {
		console.log(data);
		$scope.world.avatar = data;
	});
}

$scope.selectMapTheme = function(name) {
		var mapThemes = {
			arabesque: {cloudMapName:'arabesque', cloudMapID:'interfacefoundry.ig67e7eb'},
			fairy: {cloudMapName:'fairy', cloudMapID:'interfacefoundry.ig9jd86b'},
			sunset: {cloudMapName:'sunset', cloudMapID:'interfacefoundry.ig6f6j6e'},
			urban: {cloudMapName:'urban', cloudMapID:'interfacefoundry.ig6a7dkn'}
		};
	
		if (typeof name === 'string') {
			$scope.mapThemeSelect = name;
			map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/'+mapThemes[name].cloudMapID+'/{z}/{x}/{y}.png');
			
			$scope.world.style.maps.cloudMapName = mapThemes[name].cloudMapName;
			$scope.world.style.maps.cloudMapID = mapThemes[name].cloudMapID;
			
			//if ($scope.style.hasOwnProperty('navBG_color')==false) {
			//	$scope.setThemeFromMap();
			$scope.setThemeFromMap(name);
			//}
		}
}

$scope.setThemeFromMap = function(name) {
switch (name) { 
	case 'urban':
		angular.extend($scope.style, themeDict['urban']);
		break;
	case 'sunset':
		angular.extend($scope.style, themeDict['sunset']);
		break;
	case 'fairy':
		angular.extend($scope.style, themeDict['fairy']);
		break;
	case 'arabesque':
		angular.extend($scope.style, themeDict['arabesque']);
		break;
}
console.log($scope.style)

    db.styles.create($scope.style, function(response){
        console.log(response);
    });
}	
	
$scope.saveAndExit = function() {
	$scope.save();
	if ($scope.world.id) {
		$location.path("/edit/w/"+$scope.world.id);
	} else {
		//console
		console.log('no world id'); 
	}
}

$scope.save = function() {
	$scope.world.newStatus = false;
	console.log($scope.world);
	db.worlds.create($scope.world, function(response) {
    	console.log('--db.worlds.create response--');
    	console.log(response);
    	$scope.world.id = response[0].id; //updating world id with server new ID
    });
}

var firstWalk = [
	//0 - intro
	{title: 'Need a hand?',
	caption: 'If you haven’t built a world before, we can walk you through it.',
	height: 0,
	view: '0',
	valid: function() {return true},
	skip: false},
	//1
	{title: 'Kind',
	caption: 'What kind is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	//3
	{title: 'Location', 
	caption: 'Find its location',
	view: 'location.html',
	height: 290,
	valid: function() {return $scope.world.hasLoc},
	skip: false},
	//4
	{title: 'Name',
	caption: 'What\'s it named?',
	view: 'name.html',
	height: 62,
	valid: function() {return $scope.form.worldName.$valid},
	skip: false},
	//5
	{title: 'Time',
	caption: 'Give it a start and end time',
	view: 'time.html',
	height: 348,
	valid: function() {return $scope.form.time.$valid},
	jump: function() {return !$scope.global.kinds[$scope.world.category].hasTime;},
	skip: true},
	//6
	{title: 'Picture',
	caption: 'Upload a picture',
	view: 'picture.html',
	height: 194,
	valid: function() {return typeof $scope.world.avatar == "string"},
	skip: true},
	//
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	//
	{title: 'Done!',
	caption: 'Now you can add landmarks or edit your world',
	view: 'done.html',
	height: 56,
	skip: false}
];

var meetupWalk = [
	//0 intro
	{title: 'Claim your Meetup',
	caption: "We'll use your Meetup group to create a bubble.",
	view:'0',
	height:0,
	valid: function() {return true},
	skip:false
	},
	//1 
	{title: 'Confirm',
	caption: 'Make sure this information from Meetup.com is correct',
	view: 'meetup_confirm.html',
	height: 300,
	valid: function() {return true},
	skip: false
	},
	{title: 'Kind',
	caption: 'What kind is it?',
	view: 'kind.html',
	height: 220,
	valid: function() {return typeof $scope.world.category == "string"},
	skip: false},
	{title: 'Hashtag',
	caption: 'Enable social connections',
	view: 'hashtag.html',
	height: 132,
	valid: function() {return true},
	skip: true,
	},
	{title: 'Picture',
	caption: 'Upload a picture',
	view: 'picture.html',
	height: 194,
	valid: function() {return true},
	skip: true},
	{title: 'Maps',
	caption: 'Choose a map',
	view: 'maptheme.html',
	height: 426,
	valid: function() {return true},
	skip: true},
	{title: 'Done!',
	caption: 'Now you can add landmarks or edit your world',
	view: 'done.html',
	height: 56,
	skip: false}
];

$scope.walk = firstWalk;


function setUpProgress() {
$scope.progress = [];

var i = 0;
while (i < $scope.walk.length) {
	$scope.progress[i] = {status: ''};
	i++;
}

$scope.position = 0;
$scope.progress[$scope.position].status = 'active';

$scope.$apply();
}


////////////////////////////////////////////////////////////
////////////////////////LISTENERS///////////////////////////
////////////////////////////////////////////////////////////
$scope.$on('$destroy', function (event) {
	console.log('$destroy event', event);
	if (event.targetScope===$scope) {
		if (zoomControl) {
			zoomControl.style.display = 'block';
		}
	}
});

////////////////////////////////////////////////////////////
/////////////////////////EXECUTING//////////////////////////
////////////////////////////////////////////////////////////

console.log($routeParams._id);
World.get({id: $routeParams._id, m: true}, function(data) {
	if (data.err) {
		 console.log('World not found!');
		 console.log(data.err);
	} else {
		console.log(data);
		angular.extend($scope.world, data.world);
		angular.extend($scope.style, data.style);
		
		if ($scope.world.source_meetup) {
			$scope.walk = meetupWalk;
		}
		map.setBaseLayer('https://{s}.tiles.mapbox.com/v3/interfacefoundry.jh58g2al/{z}/{x}/{y}.png');
		setUpProgress();
	}
});

/*$scope.world = {
"_id" : "54188829effb040000eb34d9",
"hasLoc" : false,
"description" : "<p>Has been While we did Thai Food Event:</p> <p>Let's Try Famous Tuk Tuk~! </p> <p>Attention: (Every individual order one favorite Appetizer and one favorite Entrance dish) We are going to eat Family Style with serving spoon, Do not RSVP if Family style is not for you. we will split the final bill of food . Every individual is responsible to pay their own drinks.</p> <p><img src=\"http://photos3.meetupstatic.com/photos/event/9/1/c/600_400742332.jpeg\" /></p> <p>Payment: Cash Only! (Please bring change to make organizer's job easier.)</p> <p>Please take your RSVP seriously as other guests often have to be turned away. There will be a $3.00 organization fee for this meetup to be collected at the day of the event.</p> <p>Cash Only to make event organizer Job easier.</p> <p>Dinner Price: For Dinner should be around $18 to $29 per person , Big Range Because I have never been On Tuk Tuk before ( Including Tax and tips and Event fee), Plus Each individual Pays your own drinks.</p> <p><img src=\"http://photos3.meetupstatic.com/photos/event/5/d/4/a/600_400883882.jpeg\" /></p> <p>Their Yelp Link With 300+ high reviews, WE can't go wrong </p> <p><a href=\"http://www.yelp.com/biz/tuk-tuk-long-island-city\"><a href=\"http://www.yelp.com/biz/tuk-tuk-long-island-city\" class=\"linkified\">http://www.yelp.com/biz/tuk-tuk-long-island-city</a></a></p> <p>Here is some yelp review and pictures</p> <p><img src=\"http://photos1.meetupstatic.com/photos/event/6/2/e/600_400741582.jpeg\" /></p> <p>Everything was so fresh! </p> <p><img src=\"http://photos4.meetupstatic.com/photos/event/6/6/0/600_400741632.jpeg\" /></p> <p>\n\nThe summer rolls was really refreshing! Crisp veggies (more veggies than noodles). I was most impressed by the pillow soft skin, really- pillow soft and perfectly moist. I felt the basil taste was a bit overpowering. </p> <p>Also had the massaman curry with roti which was good but nothing to rave about. I enjoyed the peanuts and potato chunks in the curry! Probably would skip this next time. </p> <p><img src=\"http://photos1.meetupstatic.com/photos/event/6/b/a/600_400741722.jpeg\" /></p> <p>\n\nI had the green curry with chicken. Delicious and a good helping for $10. I have to point out on how fresh the individual vegetable ingredients were, and perfectly cooked. Seriously, \"fresh\" is the main theme of this review. </p> <p><img src=\"http://photos2.meetupstatic.com/photos/event/6/f/6/600_400741782.jpeg\" /></p> <p>\n\nTried the very raved about dish \"pad cha talay\" which I believe was about $16 for a great variety of seafood... That... Dare I say it? Was very fresh! I hate dead seafood or tiny ugly excuses of shrimp of octopus. Very generous here ESP for the price. But the real winner of the dish is the flavor itself. </p> <p><br/><img src=\"http://photos2.meetupstatic.com/photos/event/7/b/e/600_400741982.jpeg\" /></p> <p><img src=\"http://photos2.meetupstatic.com/photos/event/7/6/e/600_400741902.jpeg\" /></p> <p>There were so many spices, like what the heck is that berry looking twig thing? The blend of spices was Devine, very tasty; fairly spicy for the average person but not overwhelming where it's impossible to eat. </p> <p><img src=\"http://photos1.meetupstatic.com/photos/event/7/2/8/600_400741832.jpeg\" /></p> <p>Green tea fried ice cream for dessert. So glad I got to try this. The outer layer was so crispy and delicious.... God just so tasty just order it and see for yourself, I should have to convince you any further! </p> <p><img src=\"http://photos1.meetupstatic.com/photos/event/5/d/8/6/600_400883942.jpeg\" /></p> <p>Other things to note: great presentation of food. Everything was plated beautifully, the restaurant itself had a classy upscale vibe (I noticed this esp since I wore sweatpants and a hello kitty t shirt.....) altho you could go either way on the dress code here I feel. Attentive staff! Always refilling water (spicy food!)</p> <p><img src=\"http://photos1.meetupstatic.com/photos/event/6/7/e/600_400741662.jpeg\" /></p> <p>\n\nConclusion for the evening: definitely a repeat restaurant in our book!</p>",
"name" : "Thai Food @ Tuk Tuk",
"avatar" : "img/IF/meetup_default.jpg",
"valid" : true,
"world" : true,
"id" : "meetup_202546102",
"tags" : [ ],
"source_meetup" : {
	"how_to_find_us" : "",
	"event_url" : "http://www.meetup.com/New-York-city-Newbies-20-30S-going-out-group/events/202546102/",
	"rsvp_limit" : 0,
	"yes_rsvp_count" : 12,
	"updated" : 1408730322000,
	"visibility" : "public",
	"status" : "upcoming",
	"id" : "202546102",
	"group" : {
		"id" : 11008462,
		"group_lat" : 40.7400016784668,
		"name" : "! New York city Newbies 20-30'S going out group",
		"group_lon" : -73.98999786376953,
		"who" : "New york city Newbies"
	},
	"fee" : null,
	"venue" : null,
	"event_hosts" : [
		{
			"member_id" : 12202738,
			"member_name" : "Elizabeth"
		}
	]
	},
"permissions" : {
	"admins" : [ ],
	"viewers" : [ ]
},
"time" : {
	"end" : "1970-01-01T00:00:00Z",
	"start" : "2014-09-16T23:00:00Z",
	"created" : "2014-09-16T18:57:45.111Z"
},
"style" : {
"styleID" : "54188829effb040000eb34da",
"maps" : {
"cloudMapName" : "forum",
"cloudMapID" : "interfacefoundry.jh58g2al"
}
},
"landmarkCategories" : [ ],
"subType" : [ ],
"loc" : {
"type" : "Point",
"coordinates" : [
-74.0059,
40.7127
]
},
"__v" : 0
}
$scope.style = {};*/

}

function WalkLocationController ($scope, $rootScope, $timeout, leafletData) {
	angular.extend($scope, {tiles: tilesDict['arabesque']});
	angular.extend($scope, {center: {lat: 42,
									lng: -83,
									zoom: 15}});
	angular.extend($scope, {markers: {}});
	
	$scope.$watch('temp.MapActive', function(current, old) {
		console.log(current, old);
		if (current==true) {
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		}
	});
	
	$scope.showPosition = function(lat, lng) {
		var tempLat = lat.valueOf(),
			tempLng = lng.valueOf();
		angular.extend($scope, {markers: {
							m: {
								lat: tempLat,
								lng: tempLng,
								draggable: false
							}}});		
		$scope.center.lat = tempLat;
		$scope.center.lng = tempLng;
		$scope.world.loc = { 
			coordinates: [tempLng,tempLat]
		}
		
		$scope.world.hasLoc = true;
		$scope.$apply(function() {
			$scope.locLoading = false;
		});
		leafletData.getMap('locMap').then(function(map) {
			console.log('invalidating size');
			map.invalidateSize();
		});
		console.log('showPosition done', $scope.locLoading);
	}
	
	$scope.searchByAddress = function() {
		console.log('--searchByAddress()--');
		var geocoder = new google.maps.Geocoder();
		if (geocoder) {
			$scope.locLoading = true; 
			geocoder.geocode({'address': $scope.temp.address},
				function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {

						console.log('invalidating size');
						//map.invalidateSize();
						
						console.log(results[0].geometry.location.lat());
						$scope.showPosition(results[0].geometry.location.lat(),
						 					results[0].geometry.location.lng());
						 
					} else { console.log('No results found.')}
					
				});
		}
		
	}
	
	$scope.searchByLocation = function() {
		if (navigator.geolocation) {
			$scope.locLoading = true;
   			navigator.geolocation.getCurrentPosition(function(position) {
   				//position
				$scope.showPosition(position.coords.latitude, position.coords.longitude);	
   				
   				}, function() {
   				console.log('location error');
   			}, {timeout:5000});
   		} else {
	   		console.log('No geolocation!');
   		}
   		
	}

} 