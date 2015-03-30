'use strict';

angular.module('IF')
    .factory('Entries', function($resource) {

        return $resource("/api/entries/su/:id/:option", {
            id: '@id'
        }, {
            query: {
                method: 'GET',
                isArray:true,
                params: {
                    number: '@number'
                }
            },
            update: {
                method: 'put'
            },
            remove: {
                method: 'DELETE'
            }
        });
    });