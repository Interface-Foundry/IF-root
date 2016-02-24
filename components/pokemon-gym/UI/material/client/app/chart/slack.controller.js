(function () {
    'use strict';

    angular.module('app.chart')
        .controller('SlackStatsCtrl', ['$scope','$http', SlackStatsCtrl]);


    function SlackStatsCtrl($scope,$http) {

        console.log('asdf');

        // $http({
        //       method: 'POST',
        //       url: '/vc/slackstats',
        //       data: {
        //         bleh:'meh'
        //       }
        //     }).then(function successCallback(res){ 

        //     });

    }


})(); 

