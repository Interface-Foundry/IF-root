/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $rootScope, $http, $location, apertureService, alertManager) {

  olark('api.box.show'); //shows olark tab on this page

  //if already logged in
  if ($rootScope.showLogout){
    $location.url('/profile');
  }

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  // This object will be filled by the form
  $scope.user = {};


  //fire socialLogin
  $scope.socialLogin = function(type){

    console.log(type);

    $location.url('/auth/'+type);

    $http.post('/auth/'+type).
      success(function(user){
  
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };



  //FIRE function on click
  //---> http.post(/auth/meetup)




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

}]);

app.controller('SignupCtrl', ['$scope', '$rootScope', '$http', '$location', 'apertureService', 'alertManager', 
function ($scope, $rootScope, $http, $location, apertureService, alertManager) {

  olark('api.box.show'); //shows olark tab on this page

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




    // $http.post('/api/user/signup', data).
    //   success(function(user){
    //       if (user){
    //         $location.url('/profile');
    //       }
    //   }).
    //   error(function(err){
    //     if (err){
    //       $scope.alerts.addAlert('danger',err);
    //     }
    //   });
  }
}]);

app.controller('ForgotCtrl', ['$scope', '$http', '$location', 'apertureService', 'alertManager', function ($scope, $http, $location, apertureService, alertManager) {

  olark('api.box.show'); //shows olark tab on this page

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
          // console.log(data);
          $scope.alerts.addAlert('success','Instructions for resetting your password were emailed to you');
          $scope.user.email = '';
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

}]);


app.controller('ResetCtrl', ['$scope', '$http', '$location', 'apertureService', 'alertManager', '$routeParams', function ($scope, $http, $location, apertureService, alertManager, $routeParams) {

  olark('api.box.show'); //shows olark tab on this page

  $scope.alerts = alertManager;
  $scope.aperture = apertureService;  

  $scope.aperture.set('off');

  $http.post('/resetConfirm/'+$routeParams.token).
    success(function(data){
        
    }).
    error(function(err){
      if (err){
        //$scope.alerts.addAlert('danger',err);
        $location.path('/forgot');
      }
    });


  $scope.sendUpdatePassword = function(){

    var data = {
      password: $scope.user.password
    }

    $http.post('/reset/'+$routeParams.token, data).
      success(function(data){
        $location.path('/profile');
      }).
      error(function(err){
        if (err){
          $scope.alerts.addAlert('danger',err);
        }
      });
  };

}]);


app.controller('resolveAuth', ['$scope', '$rootScope', function ($scope, $rootScope) {

  angular.extend($rootScope, {loading: true});

  location.reload(true);

}]); 

