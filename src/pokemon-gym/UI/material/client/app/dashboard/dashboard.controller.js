(function() {
  'use strict';
  angular
    .module('app')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['stats', '$scope'];

  function DashboardController(stats, $scope) {
    const vm = this;
    vm.data = {};
    vm.data.totalCounts = {};
    vm.data.products = {};

    const timeData = ['monthStats', 'dayOfWeekStats', 'thirtyDayStats', 'dailyActiveUsers',
      'monthlyActiveUsers'];
    let sources = [];

    vm.productsOptions = {
      scales: {
        xAxes: [{
          ticks: {
            callback: value => value.substr(0, 10),
          },
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
      tooltips: {
        enabled: true,
        callbacks: {
          title: (tooltipItems, data) => data.labels[tooltipItems[0].index],
          label: (tooltipItems) => tooltipItems.yLabel,
        },
      },
    };

    vm.productGroupClick = event => {
      if (!event[0] || !event[0]._model || !event[0]._model.label) return;
      const { data } = vm;
      delete data.products.data;
      delete data.products.labels;
      vm.data.products.groupName = event[0]._model.label;
      const productGroup = data.allItems.find(pg => pg.name === data.products.groupName);
      const sortedData = _.sortBy(productGroup.products, product => product.count).reverse();
      data.products.data = sortedData.map(product => product.count);
      data.products.labels = sortedData.map(product => product.name);
      $scope.$apply();
    };

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

    const setProductData = () => {
      const { data } = vm;
      data.productGroups = {};
      const sortedData = _.sortBy(data.allItems, group => group.count).reverse();
      data.productGroups.data = sortedData.map(group => group.count);
      data.productGroups.labels = sortedData.map(group => group.name);
    };

    stats.data().then(result => {
      const { data } = vm;
      timeData.forEach(set => {
        data[set] = result.data[set];
      });
      data.searchCounts = result.data.searchCounts;
      data.banterCounts = result.data.banterCounts;
      data.monthlySlackTeams = result.data.monthlySlackTeams;
      data.averageSlackTeamSize = result.data.averageSlackTeamSize;
      data.allItems = result.data.items;
      sources = Object.keys(data.banterCounts);
      sources.forEach(source => {
        data.totalCounts[source] = 0 + data.searchCounts.initial[source] +
          data.searchCounts.modify[source] + data.banterCounts[source];
      });
      vm.setSearchCountScope('total');
      setProductData();
      setSlackTeams();
    });

    vm.setSearchCountScope = newSource => {
      vm.searchCountScope = newSource;
      vm.searchSources = sources.filter(source => source !== 'web');
      setTimeBasedData(newSource);
    };
  }
})();
