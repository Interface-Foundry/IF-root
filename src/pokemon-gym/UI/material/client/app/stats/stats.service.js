(function() {
  'use strict';

  angular
    .module('app')
    .factory('stats', StatsService);

  StatsService.$inject = ['$http'];
  function StatsService($http) {
    const stats = {
      dayOfWeek: () => $http.get('/dayofweek'),
      data: () => $http.get('/data'),
    };

    return stats;
  }
}
)();
