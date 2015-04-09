app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', 'worldTree', 'beaconManager', 'lockerManager', 'contest', 'navService', 'analyticsService', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs, worldTree, beaconManager, lockerManager, contest, navService, analyticsService) {
console.log('init controller-indexIF');
$scope.aperture = apertureService;
$scope.map = mapManager;
$scope.style = styleManager;
$scope.alerts = alertManager;
$scope.userManager = userManager;
$scope.navService = navService;

$scope.dialog = dialogs;
    
angular.extend($rootScope, {globalTitle: "Bubbl.li"}); 

$rootScope.hideBack = true; //controls back button showing

var deregFirstShow = $scope.$on('$routeChangeSuccess', _.after(2, function() {
	console.log('$routeChangeSuccess');
	console.log(arguments);
	$rootScope.hideBack = false;
	deregFirstShow();
}))

$scope.newWorld = function() {
    console.log('newWorld()');
    $scope.world = {};
    $scope.world.newStatus = true; //new
    db.worlds.create($scope.world, function(response){
      console.log('##Create##');
      console.log('response', response);
      $location.path('/edit/walkthrough/'+response[0].worldID);
    });
} //candidate for removal, should use worldTree.createWorld instead

$scope.search = function() {
	if ($scope.searchOn == true) {
		//call search
		console.log('searching');
		$location.path('/search/'+$scope.searchText);
		$scope.searchOn = false;
	} else {
		$scope.searchOn = true;
	}
}

$scope.wtgtLogin = function() {
	contest.login(new Date);
}

logSearchClick = function(path) {
	analyticsService.log('search.general.clickthrough', {
		path: path,
		searchText: $scope.searchText || $('.search-bar').val()
	});
};
	
$scope.go = function(path) {
	logSearchClick(path);
	navService.reset();
	$location.path(path);
} 
	
$scope.goBack = function() {
	navService.reset();
	$window.history.back();
}

$scope.logout = function() {
	userManager.logout();
}

$scope.feedbackCategories = [
	{category: "map request"},
	{category: "complaint"},
	{category: "feature idea"},
	{category: "other suggestion"}
];

$scope.feedbackEmotions = [
	{emotion: "excited"},
	{emotion: "angry"},
	{emotion: "confused"}
];

$scope.feedbackCategory = "";
$scope.feedbackEmotion = "";
$scope.feedbackText = "";

$scope.sendFeedback = function() { //sends feedback email. move to dialog directive

	debugger;

    var data = {
		feedbackCategory: $scope.feedbackCategory || "no category",
		feedbackEmotion: $scope.feedbackEmotion || "no emotion",
		feedbackText: $scope.feedbackText || null
    };

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
		dialog.close();
        alert('Feedback sent, thanks!');

      }).
      error(function(err){
        console.log('there was a problem');
    });
};

/*
$scope.sessionSearch = function() { 
    $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
};
*/
    
$scope.getNearby = function($event) {
	$scope.nearbyLoading = true;
	worldTree.getNearby().then(function(data) {
    $scope.altBubbles = data['150m'];
    $scope.nearbyBubbles = data['2.5km'];
		$scope.nearbyLoading = false;
	}, function(reason) {
		console.log('getNearby error');
		console.log(reason);
		$scope.nearbyLoading = false;
	})
	$event.stopPropagation();
}

$scope.share = function(platform) {
  var link;
  var height = 450;
  var width = 560;
  //center popup on screen
  var left = (screen.width - width)/2;
  var top = (screen.height - height)/2;
  
  if (platform == 'facebook') {
    link = 'https://www.facebook.com/sharer/sharer.php?u=https://bubbl.li'+$location.url();
  }
  else if (platform == 'twitter') {
    link = 'https://twitter.com/intent/tweet?url=https://bubbl.li'+$location.url();
  }
  window.open(
    link,
    'Bubbl.li',
    'height=450,width=558,top='+top+',left='+left+'scrollbars'
  );
};

//@IFDEF PHONEGAP
$scope.fbLogin = function() {
	userManager.fbLogin().then(
		function (success) {
			console.log(success);
			userManager.checkLogin();
		}, function (failure) {
			console.log(failure);	
		})
}
//@ENDIF


//@IFDEF IBEACON
if (beaconManager.supported == true) {
	beaconManager.startListening();
}
//@ENDIF

//@IFDEF KEYCHAIN
//On Phonegap startup, try to login with either saved username/pw or facebook
lockerManager.getCredentials().then(function(credentials) {
	if (credentials.username, credentials.password) {
		userManager.signin(credentials.username, credentials.password).then(function(success) {
			userManager.checkLogin().then(function(success) {
			console.log(success);
			});
		}, function (reason) {
			console.log('credential signin error', reason)
		});
	} else if (credentials.fbToken) {
		ifGlobals.fbToken = credentials.fbToken;
		userManager.checkLogin().then(function(success) {
			console.log(success);	
		})
	}
}, function(err) {
	console.log('credential error', error); 
});
//@ENDIF



}]);
