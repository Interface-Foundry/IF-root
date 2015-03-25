'use strict';

angular.module('IF')
    .factory('Contests', function($resource) {

        return $resource("/api/contests/:id/:option", {
            id: '@id'
        }, {
            update: {
                method: 'put'
            },
            scan: {
                method: 'POST',
                isArray:true,
                params: {
                    option: 'scan'
                }
            },
            sort: {
                method: 'POST',
                isArray: true,
                params: {
                    option: 'sort'
                }
            },
            remove: {
                method: 'DELETE'
            }
        });
    });