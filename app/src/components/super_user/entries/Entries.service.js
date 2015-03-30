'use strict';

angular.module('IF')
  .factory('Entries', Entries);

Entries.$inject = ['$http', '$resource'];

function Entries($http, $resource) {

  var resource = $resource("/api/entries/su/:id/:option", {
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

  return {
    getValidEntries: getValidEntries,
    resource: resource
  };

  function getValidEntries(region, number) {
    var params = {
      number: number
    }
    return $http.get('/api/entries/' + region, {params: params})
  }


}