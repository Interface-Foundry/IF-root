/**********************************************************************
 * Login controller
 **********************************************************************/
function LoginCtrl($scope, $rootScope, $http, $location, apertureService) {
  
  $scope.alerts = [];

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
          else {
            console.log('asdfasdf');
            $scope.addAlert('danger','uhhhhh');
          }
      }).
      error(function(err){
        console.log('asdf');
        if (err){
           console.log(err);
        }

      });

  };


  $scope.addAlert = function(alertType,alertMsg) {
    $scope.alerts.push({type: alertType, msg: alertMsg});
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
}

function SignupCtrl($scope, $rootScope, $http, $location, apertureService) {

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

    $http.post('/api/user/signup', data).success(function(user){
        if (user){
          $location.path('/profile');
        }
    });
  }
}

function ProfileCtrl($scope, $rootScope, $http, $location, apertureService){

  $scope.aperture = apertureService;  
  $scope.aperture.set('off');
  
	// This object will be filled by the form
  $scope.user = {};
  
  $scope.worlds = [];

  $http.get('/api/user/profile').success(function(user){
  	console.log(user);
  	$scope.worlds = user; 
  });
  
  
}

