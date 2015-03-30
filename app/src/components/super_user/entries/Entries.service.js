'use strict';

angular.module('IF')
    .factory('Entries', function($resource) {

        return $resource("/api/entries/su/:id/:option", {
            id: '@id'
        }, {
            query: {
                method: 'GET',
                params: {
                    number: '@number'
                },
                isArray: true
            },
            update: {
                method: 'put'
            },
            remove: {
                method: 'DELETE'
            }
        });
    });