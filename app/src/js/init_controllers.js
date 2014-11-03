
/* IF Controllers */

//searching for bubbles
app.controller('WorldRouteCtrl', ['$location', '$scope', '$routeParams', 'db', '$rootScope', 'styleManager', 'mapManager', 
function ($location, $scope, $routeParams, db, $rootScope, styleManager, mapManager) {

var map = mapManager;
// map.resetMap();

angular.extend($rootScope, {loading: true});
var style = styleManager;
style.resetNavBG();

console.log('world routing');
    
$scope.initGeo = function() {

      //--- GEO LOCK -----//

if (navigator.geolocation) {
	console.log('geolocation');
	function showPosition(position) {
		var userLat = position.coords.latitude;
		var userLon = position.coords.longitude;
		findWorlds(userLat, userLon); 
	}

	function locError(){
		console.log('error finding loc');
		//geo error
		noLoc();
	}
	
	navigator.geolocation.getCurrentPosition(showPosition, locError, {timeout:15000, enableHighAccuracy : true});

} else {
	console.log('no geo');
	alert('Your browser does not support geolocation :(');
}

      //--------------//     
}

//initial loc bubble query
$scope.initGeo();

function noLoc() {
  console.log('no loc');  
  $scope.showNoLoc = true;
  angular.extend($rootScope, {loading: false});
  $scope.$apply();
}

function findWorlds(lat,lon){   
     
console.log('findWorlds');
$scope.worlds = db.worlds.query({ localTime: new Date(), userCoordinate:[lon,lat]}, function(data){
	$rootScope.altBubbles = data[0].liveAndInside;
	$rootScope.nearbyBubbles = data[0].live;

	if (data[0].liveAndInside[0] != null) {
		if (data[0].liveAndInside[0].id){
			$location.path('w/'+data[0].liveAndInside[0].id); 
		} else {
			console.log('world has no id');
	        noWorlds(lat,lon);
		}
	} else {
		console.log('not inside any worlds');
		noWorlds(lat,lon); //not inside any worlds
	}
});
}

function noWorlds(lat,lon){
	map.setCenter([lon, lat], 18, $scope.aperture.state);
		console.log('no worlds');  
		$scope.showCreateNew = true;
		angular.extend($rootScope, {loading: false});
    }

$scope.addWorld = function (){
  $location.path( '/profile' );
};

}]);

//loads everytime

app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', 'worldTree', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs, worldTree) {
	console.log('init controller-indexIF');
    $scope.aperture = apertureService;
    $scope.map = mapManager;
    $scope.style = styleManager;
    $scope.alerts = alertManager;
    $scope.userManager = userManager;
    
    $scope.dialog = dialogs;
    $rootScope.messages = [];
    //$rootScope.loadMeetup = false;
    
    angular.extend($rootScope, {globalTitle: "Bubbl.li"});
    angular.extend($rootScope, {navTitle: "Bubbl.li"})
	angular.extend($rootScope, {loading: false});
	
	/*$scope.$on('$viewContentLoaded', function() {
		document.getElementById("wrap").scrollTop = 0
	});*/
	
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
};
	
$scope.logout = function() {
      $http.get('/api/user/logout');
      userManager.loginStatus = false;
      //$location.url('/');
};
	  
    // /!\ /!\ Change this to call to function in app.js instead /!\ /!\
    //================================================
    // Check if the user is connected
    //================================================
/*
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      //============== Refresh page to show Login auth =====//
      // Initialize a new promise
      var deferred = $q.defer();
      
	  userManager.getUser().then(function(user) {
		  $scope.loginStatus = true;
		  $scope.user = user;
		  if (user._id){
			  $rootScope.userID = user._id;
		  }
		  $timeout(deferred.resolve, 0);
	  }, function(reason) {
		  console.log(reason);
		  $scope.loginStatus = false;
		  $timeout(function(){deferred.reject();}, 0);
	  });
	  
	  userManager.getDisplayName().then(function(displayName) {
		  $scope.user.displayName = displayName;
	  });

      return deferred.promise;
};
*/
    //================================================//

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
        
        $scope.feedbackOn = false;
    };

    //check if logged in
    //checkLoggedin($q, $timeout, $http, $location, $rootScope);

    //search query
    $scope.sessionSearch = function() { 
        $scope.landmarks = db.landmarks.query({queryType:"search", queryFilter: $scope.searchText});
    };
    
$scope.getNearby = function($event) {
	$scope.nearbyLoading = true;
	worldTree.getNearby().then(function(data) {
		$scope.altBubbles = data.liveAndInside;
		$scope.nearbyBubbles = data.live;
		$scope.nearbyLoading = false;
	}, function(reason) {
		console.log('getNearby error');
		$scope.nearbyLoading = false;
	})
	$event.stopPropagation();
}

}]);

