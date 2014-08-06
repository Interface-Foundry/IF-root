/**********************************************************************
 * Login controller
 **********************************************************************/
function LoginCtrl($scope, $rootScope, $http, $location, apertureService, alertManager) {

  //if already logged in
  if ($rootScope.showLogout){
    $location.url('/profile');
  }

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){

    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }

    $http.post('/api/user/login', data).
      success(function(user){
          if (user){
            $location.url('/profile');
          }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}

function SignupCtrl($scope, $rootScope, $http, $location, apertureService, alertManager) {

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  
  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.signup = function(){
    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }
    $http.post('/api/user/signup', data).
      success(function(user){
          if (user){
            $location.url('/profile');
          }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
    $http.post('/api/user/signup', data).
      success(function(user){
          if (user){
            $location.url('/profile');
          }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  }
}

function ProfileCtrl($scope, $rootScope, $http, $location, apertureService, Landmark){

  $scope.aperture = apertureService;  
  $scope.aperture.set('off');
  
	// This object will be filled by the form
  $scope.user = {};
  
  $scope.worlds = [];

  $http.get('/api/user/profile').success(function(user){
  	console.log(user);
  	$scope.worlds = user; 
  });
  
  $scope.deleteWorld = function(i) {
  	 var deleteConfirm = confirm("Are you sure you want to delete this?");
  	 if (deleteConfirm) {
	  Landmark.del({_id: $scope.worlds[i]._id}, function(world) {
	            //$location.path('/');
	            console.log('Delete');
	            $scope.worlds.splice(i, 1); //Removes from local array
	  });
	  }
  }
}

