app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', 'worldTree', 'beaconManager', 'lockerManager', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs, worldTree, beaconManager, lockerManager) {
console.log('init controller-indexIF');
$scope.aperture = apertureService;
$scope.map = mapManager;
$scope.style = styleManager;
$scope.alerts = alertManager;
$scope.userManager = userManager;
$scope.url = $location.absUrl();

$scope.dialog = dialogs;
    
angular.extend($rootScope, {globalTitle: "Bubbl.li"});

$scope.$on('$viewContentLoaded', function() {
// 	angular.forEach(document.getElementsByClassName("wrap"), function(element) {element.scrollTop = 0});
});

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
	
$scope.go = function(path) {
	$location.path(path);
}
	
$scope.goBack = function() {
	$window.history.back();
}

$scope.logout = function() {
      $http.get('/api/user/logout', {server:true});
      userManager.loginStatus = false;
      //$location.url('/');
}

$scope.sendFeedback = function(){

    var data = {
      emailText: ('FEEDBACK:\n' + $sanitize($scope.feedbackText) + '\n===\n===\n' + $rootScope.userName)
    }

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
        alert('Feedback sent, thanks!');

      }).
      error(function(err){
        console.log('there was a problem');
    });
    
    if ($scope.feedback) {
        $scope.feedback.on = false;
    } else {
        $scope.feedback = {
	        on: false
        }
    }
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

//@IFDEF IBEACON
if (beaconManager.supported == true) {
	beaconManager.startListening();
}
//@ENDIF


}]);