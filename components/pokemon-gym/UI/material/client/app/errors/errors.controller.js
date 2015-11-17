(function () {
    'use strict';

    angular.module('app.errors')
        .controller('ErrorsCtrl', ['$scope', '$filter', '$http',ErrorsCtrl]);

    function ErrorsCtrl($scope, $filter, $http) {

        var init;

        var currURL = window.location.href;

        if (currURL.indexOf('node') > -1){
          getErrors('node');
        }
        else if (currURL.indexOf('front-end') > -1){
          getErrors('front-end');
        }
        else if (currURL.indexOf('processing') > -1){
          getErrors('processing');
        }

        function getErrors(type){

          $scope.tester = 'asdfasdfd';

          $http.get('http://pikachu.kipapp.co:9999/errors/'+type).
          then(function(res) {        
              console.log(res.data);

              $scope.errors = res.data;

          });        

        }




    }

})(); 