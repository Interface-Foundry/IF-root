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
    const timeData = ['monthStats', 'dayOfWeekStats', 'thirtyDayStats', 'dailyActiveUsers',
      'monthlyActiveUsers'];
    let sources = [];

    const setTimeBasedData = scope => {
      const { data } = vm;
      timeData.forEach(set => {
        delete data[set].data;
        delete data[set].labels;
        const sortedData = _.sortBy(data[set], time => time.idNumber);
        data[set].data = sortedData.map(time => time[scope]);
        data[set].labels = sortedData.map(time => time.idString);
      });
    };

    const setSlackTeams = () => {
      const { data } = vm;
      const sortedData = _.sortBy(data.monthlySlackTeams, month => month.idNumber);
      data.monthlySlackTeams.data = sortedData.map(month => month.teams);
      data.monthlySlackTeams.labels = sortedData.map(month => month.idString);
    };

    stats.data().then(result => {
      const { data } = vm;
      timeData.forEach(set => {
        data[set] = result.data[set]
      });
      data.searchCounts = result.data.searchCounts;
      data.banterCounts = result.data.banterCounts;
      data.monthlySlackTeams = result.data.monthlySlackTeams;

      sources = Object.keys(data.banterCounts);
      sources.forEach(source => {
        data.totalCounts[source] = 0 + data.searchCounts.initial[source] +
          data.searchCounts.modify[source] + data.banterCounts[source];
      });
      vm.setSearchCountScope('total');
      setSlackTeams();
    });

    vm.setSearchCountScope = newSource => {
      vm.searchCountScope = newSource;
      vm.searchSources = sources.filter(source => source !== 'web');
      setTimeBasedData(newSource);
    };
  }
})();
