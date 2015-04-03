app.controller('indexIF', ['$location', '$scope', 'db', 'leafletData', '$rootScope', 'apertureService', 'mapManager', 'styleManager', 'alertManager', 'userManager', '$route', '$routeParams', '$location', '$timeout', '$http', '$q', '$sanitize', '$anchorScroll', '$window', 'dialogs', 'worldTree', 'beaconManager', 'lockerManager', 'contest', 'navService', function($location, $scope, db, leafletData, $rootScope, apertureService, mapManager, styleManager, alertManager, userManager, $route, $routeParams, $location, $timeout, $http, $q, $sanitize, $anchorScroll, $window, dialogs, worldTree, beaconManager, lockerManager, contest, navService) {
console.log('init controller-indexIF');
$scope.aperture = apertureService;
$scope.map = mapManager;
$scope.style = styleManager;
$scope.alerts = alertManager;
$scope.userManager = userManager;
$scope.navService = navService;

$scope.dialog = dialogs;

// ---------------- SPLASH PAGES
if ($location.path().indexOf('email/confirm') > -1) { // check if user is confirming email
	createShowSplash('confirmThanks');

	// get token from url
	var token = $location.path().slice(15);

	$http.post('/email/request_confirm/' + token).
		success(function(data) {
			$scope.confirmThanksText = data.err ? 'There was a problem confirming your email' : 'Thanks for confirming your email!';
		}).
		error(function(err) {
			$scope.confirmThanksText = 'There was a problem confirming your email';
		});

	// redirect to home page
	$location.path('/');
} else {
	userManager.getUser().then(function(success) {
		createShowSplash(true);
	}, function(err) {
		createShowSplash(false);
	});
}


function createShowSplash(condition) {
	// $scope.show controls the logic for the splash pages
	
	$scope.show = {
		/**
		 * splash: for general splash
		 * confirm: for confirm dialog
		 * confirmThanks: for confirmThanks dialog
		 * close: for close button
		 * signin: for sign in dialog
		 * register: for register dialog
		 */
	};

	if (condition === 'confirmThanks') {
		$scope.show.splash = true;
		$scope.show.confirm = false;
		$scope.show.confirmThanks = true;
	} else if (condition) { // logged in
		$scope.show.splash = !userManager.loginStatus || !userManager._user.local.confirmedEmail;
		$scope.show.confirm = userManager.loginStatus && 
			!userManager._user.local.confirmedEmail &&
			!userManager._user.facebook; // don't show confirm dialog for fb authenticated users
		$scope.show.confirmThanks = false; 
	} else { // not logged in
		$scope.show.splash = true;
		$scope.show.confirm = false;
		$scope.show.confirmThanks = false;
	}

	// @IFDEF WEB
	$scope.show.close = true; // only show close button (home, not confirm) on web
	// @ENDIF
	$scope.show.signin = false;
	$scope.show.register = false;
}

$scope.setShowSplash = function(property, bool) {
	$scope.show[property] = bool;
};

$scope.splashNext = function() {
	// login or create account, depending on context

	if ($scope.show.signin) {
		userManager.signin(userManager.login.email, userManager.login.password).then(function(success) {
			$scope.show.signin = false;
			$scope.show.splash = false;
		}, function(err) {
			// add notification here TODO toks
		})
	} else if ($scope.show.register) {
		var watchSignupError = $scope.$watch('userManager.signup.error', function(newValue) {
			if (newValue === false) { // signup success
				$scope.show.register = false;
				$scope.show.splash = false;
				watchSignupError(); // clear watch
			} else if (newValue) { // signup error
				// add notification here TODO toks
				watchSignupError(); // clear watch
			}
		});
		userManager.signup.signup();
	}
};
// ---------------- END SPLASH PAGES
    
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
	
$scope.go = function(path) {
	navService.reset();
	$location.path(path);
} 
	
$scope.goBack = function() {
	navService.reset();
	$window.history.back();
}

$scope.logout = function() {
      $http.get('/api/user/logout', {server:true});
      userManager.loginStatus = false;
      //$location.url('/');
} //switch to userManager method

$scope.sendFeedback = function(text) { //sends feedback email. move to dialog directive

    var data = {
      emailText: ('FEEDBACK:\n' + $sanitize(text) + '\n===\n===\n' + $rootScope.userName)
    }

    $http.post('feedback', data).
      success(function(data){
        console.log('feedback sent');
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