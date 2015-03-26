'use strict';

angular.module('IF')
    .factory('Announcements', function($resource) {

        return $resource("/api/announcements/:id/:option", {
            id: '@id'
        }, {
            update: {
                method: 'put'
            },
            save: {
                method: 'POST',
                isArray:true
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