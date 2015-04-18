'use strict';

angular.module('IF')
    .factory('Contests', function($resource) {

        return $resource("/api/contests/:id/:option", {
            id: '@id'
        }, {
            update: {
                method: 'put',
				server: true
            },
            scan: {
                method: 'POST',
                isArray:true,
                params: {
                    option: 'scan'
                },
				server: true
            },
            remove: {
                method: 'DELETE',
				server: true
            }
        });
    });
