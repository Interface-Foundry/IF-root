'use strict';

angular.module('IF')
    .factory('Announcements', function($resource) {

        return $resource("/api/announcements/su/:id/:option", {
            id: '@id'
        }, {
            update: {
                method: 'put',
				server: true
            },
            save: {
                method: 'POST',
                isArray:true,
				server: true
            },
            sort: {
                method: 'POST',
                isArray: true,
                params: {
                    option: 'sort'
                },
				server: true
            },
            remove: {
                method: 'DELETE',
                isArray:true,
				server: true
            }
        });
    });
