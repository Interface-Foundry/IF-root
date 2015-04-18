'use strict';

angular.module('IF')
  .factory('Entries', Entries);

Entries.$inject = ['$http', '$resource'];

function Entries($http, $resource) {

  var resource = $resource("/api/entries/:id/:option", {
    id: '@id'
  }, {
    query: {
      method: 'GET',
      params: {
        number: '@number'
      },
      isArray: true,
	  server: true
    },
    update: {
      method: 'put',
	  server: true
    },
    remove: {
      method: 'DELETE',
	  server: true
    }
  });

  return {
    resource: resource
  };

}
