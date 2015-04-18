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
      method: 'put'
    },
    remove: {
      method: 'DELETE'
    }
  });

  return {
    resource: resource
  };

}
