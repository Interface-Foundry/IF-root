/**********************************************************************
 * Login controller
 **********************************************************************/
function LoginCtrl($scope, $rootScope, $http, $location) {

  // This object will be filled by the form
  $scope.user = {};

  // Register the login() function
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.user.username,
      password: $scope.user.password,
    })
    .success(function(user){
      // No error: authentication OK
      $rootScope.message = 'Authentication successful!';
      console.log('yay');
      $location.url('/profile');
    })
    .error(function(){
      // Error: authentication failed
      console.log('boo');
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };

}

function ProfileCtrl($scope, $rootScope, $http, $location){
	// This object will be filled by the form
  $scope.user = {};

  console.log('asdf');

  // $http.get('/profile').success(function(user){

  // 	console.log(user);
  //   // for (var i in users)
  //   //   $scope.users.push(users[i]);
  // });

}