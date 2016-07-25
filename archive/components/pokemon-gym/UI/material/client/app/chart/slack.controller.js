(function () {
    'use strict';

    angular.module('app.chart')
        .controller('SlackStatsCtrl', ['$scope','$http', SlackStatsCtrl]);


    function SlackStatsCtrl($scope,$http) {

        $http({
          method: 'GET',
          url: '/vc/slackstats'
          // data: {
          //   bleh:'meh'
          // }
        }).then(function successCallback(res){ 
            console.log('suc ',res);
        },function errorCallback(res) {
            console.log('err ',res);
        });

    }


})(); 

