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


function ForgotCtrl($scope, $http, $location, apertureService, alertManager) {


  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};

  $scope.sendForgot = function(){

    var data = {
      email: $scope.user.email
    }

    $http.post('/forgot', data).
      success(function(data){
          console.log(data);
          // if (user){
          //   $location.url('/profile');
          // }
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}



function ResetCtrl($scope, $http, $location, apertureService, alertManager, $routeParams) {


  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  $http.post('/resetConfirm/'+$routeParams.token).
    success(function(data){
        console.log(data);
    }).
    error(function(err){
      if (err){
        $scope.alerts.addAlert('danger',err);
        $location.url('/forgot');
      }
    });

  $scope.sendUpdatePassword = function(){

    var data = {
      password: $scope.user.password
    }

    $http.post('/reset/'+$routeParams.token, data).
      success(function(data){
        $location.url('/profile');
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}

