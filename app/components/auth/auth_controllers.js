/**********************************************************************
 * Login controller
 **********************************************************************/
function LoginCtrl($scope, $rootScope, $http, $location) {

  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){
    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }

    $http.post('/api/user/login', data).success(function(user){
        if (user){
          $location.url('/profile');
        }   
    });
  }
}

function SignupCtrl($scope, $rootScope, $http, $location) {

  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.signup = function(){
    var data = {
      email: $scope.user.email,
      password: $scope.user.password
    }

    $http.post('/api/user/signup', data).success(function(user){
        if (user){
          $location.url('/profile');
        }   
    });
  }
}

function ProfileCtrl($scope, $rootScope, $http, $location){
	// This object will be filled by the form
  $scope.user = {};
  
  $scope.worlds = [];

  $http.get('/api/user/profile').success(function(user){
  	console.log(user);
  	$scope.worlds = user; 
  });
}

