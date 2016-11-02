(function() {
  'use strict';
  angular
    .module('app')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['stats'];

  function DashboardController(stats) {
    const vm = this;
    vm.data = {};
    vm.data.totalCounts = {};
    vm.dayOfWeek = {};
    let sources = [];

    const setDayofWeekData = scope => {
      const { data } = vm;
      delete data.dayOfWeekStats.data;
      delete data.dayOfWeekStats.labels;
      const dayData = _.sortBy(data.dayOfWeekStats, day => day.dayNumber);
      data.dayOfWeekStats.data = dayData.map(
        day => day.sources.find(source => source.source === scope).num);
      data.dayOfWeekStats.labels = dayData.map(day => day.dayString);
    };

    stats.data().then(result => {
      const { data } = vm;
      data.searchCounts = result.data.searchCounts;
      data.banterCounts = result.data.banterCounts;
      data.dayOfWeekStats = result.data.dayOfWeekStats;
      sources = Object.keys(data.banterCounts);
      sources.forEach(source => {
        data.totalCounts[source] = 0 + data.searchCounts.initial[source] +
          data.searchCounts.modify[source] + data.banterCounts[source];
      });
      vm.setSearchCountScope('total');
    });

    vm.setSearchCountScope = newSource => {
      vm.searchCountScope = newSource;
      vm.searchSources = sources.filter(source => source !== vm.searchCountScope);
      setDayofWeekData(newSource);
    };
  }
})();
