'use strict';

angular.module('IF')
    .factory('Entries', function($resource) {

        return $resource("/api/entries/:id/:option", {
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
            remove: {
                method: 'DELETE'
            }
        });
    });