'use strict';

angular.module('IF')
    .controller('SuperuserController', function($scope, Announcements) {
        Announcements.get().$promise
            .then(function(announcements) {
                $scope.announcements = announcements;
            })
    });