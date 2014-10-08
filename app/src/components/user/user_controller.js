function UserController($scope, $rootScope, $http, $location, $route, $routeParams, userManager, $q, $timeout, $upload, Landmark, db, alertManager) {

angular.extend($rootScope, {loading: false});

$scope.state = {};
$scope.subnav = {
	profile: ['me', 'contacts', 'history'],
	worlds: ['worlds', 'drafts', 'filter']
}
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

//if user login came from Meetup, then process new meetup worlds
if ($routeParams.incoming == 'meetup'){
	angular.extend($rootScope, {loading: true});
	$scope.fromMeetup = true;
	$http.post('/api/process_meetups').success(function(response){
		angular.extend($rootScope, {loading: false});
		$http.get('/api/user/profile').success(function(user){
			$scope.worlds = user;		
		});
	});

}
else {
	$http.get('/api/user/profile').success(function(user){
		console.log(user);
		$scope.worlds = user;		
	});
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

userManager.getUser().then(
	function(response) {
	console.log(response);
	$scope.user = response;
})

}