'use strict';

angular.module('IF')
    .factory('Contests', function($resource) {

        return $resource("/api/contests/:id/:option", {
            id: '@id'
        }, {
            update: {
                method: 'put'
            },
             save: {
                method: 'POST'
            },
            scan: {
                method: 'POST',
                isArray:true,
                params: {
                    option: 'scan'
                }
            },
            remove: {
                method: 'DELETE'
            }
        });
    });