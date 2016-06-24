// LICENSE CODE ZON ISC
'use strict'; /*jslint browser:true*/
define(['angular', 'socket.io-client', 'es6_shim', 'angular-material',
    'md-data-table', 'angular-chart',
    '../health_markers/health_markers', 'css!./proxies'],
    function(angular, io){

var proxies = angular.module('lum-proxies', ['ngMaterial', 'md.data.table',
    'chart.js', 'lum-health-markers']);

proxies.value('lumProxyWindowConfig', {
    refresh: 100,
    size: 25*1000,
    delay: 2*1000,
    history: 50*1000
});

proxies.service('lumProxyGraphOptions', ProxyGraphOptions);
ProxyGraphOptions.$inject = ['$interval', 'lumProxyWindowConfig'];
function ProxyGraphOptions($interval, win_config){
    this.$interval = $interval;
    this._config = win_config;
    this._time_options = {};
    this._usage_counter = 0;
    this._options = {
        animation: {duration: 0},
        elements: {
            line: {borderWidth: 0.5},
            point: {radius: 0},
        },
        fill: true,
        legend: {display: false},
        scales: {
            xAxes: [{
                display: false,
                type: 'time',
                time: this._time_options,
            }],
            yAxes: [{
                position: 'right',
                ticks: {
                    min: 0,
                    stepSize: 1,
                    suggestedMax: 1,
                    beginAtZero: true,
                    callback: function(value){
                        return Math.floor(value)==value ? value : ''; },
                }
            }],
            gridLines: {display: false},
        },
        tooltips: {enabled: false},
    };
    return this;
}

ProxyGraphOptions.prototype.calculate_window = function(){
    var end = Date.now() - this._config.delay;
    var start = end - this._config.size;
    this._time_options.min = start;
    this._time_options.max = end;
};

ProxyGraphOptions.prototype.get_options = function(){
    ++this._usage_counter;
    if (!this._interval)
    {
        this.calculate_window();
        // XXX lee - causes browser to show as if reloading
        this._interval = this.$interval(this.calculate_window.bind(this),
            this._config.refresh);
    }
    return this._options;
};

ProxyGraphOptions.prototype.release_options = function(){
    if (!--this._usage_counter)
    {
        this.$interval.cancel(this._interval);
        this._interval = null;
    }
};

proxies.factory('lumProxies', proxiesService);
proxiesService.$inject = ['$q', '$interval', 'lumProxyWindowConfig'];
function proxiesService($q, $interval, win_config){
    var deffered = $q.defer();
    io().on('proxies', function(proxies){
        proxies.forEach(function(proxy){
            proxy.stats = {
                hosts: [],
                ticks: [],
                active_requests: [],
            };
        });
        deffered.resolve(proxies);
    }).on('stats', function(stats_chunk){
        var now = Date.now();
        var history_start = now - win_config.history;
        deffered.promise.then(function(proxies){
            for (var port in stats_chunk)
            {
                var stats = stats_chunk[port];
                var proxy = proxies.find(function(p){
                    return p.port==port; });
                var i = proxy.stats.ticks.findIndex(function(tick){
                    return tick>=history_start; });
                if (i)
                {
                    proxy.stats.ticks.splice(0, i);
                    proxy.stats.active_requests.forEach(
                        function(active_requests){
                            active_requests.splice(0, i); });
                }
                for (var host in stats)
                {
                    if (!proxy.stats.hosts.includes(host))
                        proxy.stats.hosts.push(host);
                }
                proxy.stats.hosts.forEach(function(host, i){
                    var active_requests = proxy.stats.active_requests[i];
                    if (!active_requests)
                        active_requests = proxy.stats.active_requests[i] = [];
                    active_requests.push(stats[host].active_requests);
                });
                proxy.stats.ticks.push(now);
            }
        });
    });
    return deffered.promise;
}

proxies.value('lumOptColumns', [
    {key: 'super_proxy', title: 'Host'},
    {key: 'zone', title: 'Zone'},
    {key: 'country', title: 'Country'},
    {key: 'state', title: 'State'},
    {key: 'city', title: 'City'},
    {key: 'session_timeout', title: 'Session timeout'},
    {key: 'dns', title: 'DNS'},
    {key: 'resolve', title: 'Resolve'},
    {key: 'pool_size', title: 'Pool size'},
    {key: 'max_requests', title: 'Max requests'},
    {key: 'log', title: 'Log'},
]);

proxies.controller('ProxiesTable', ProxiesTableController);
ProxiesTableController.$inject = ['lumProxies', 'lumOptColumns',
    'lumProxyGraphOptions'];
function ProxiesTableController(lum_proxies, opt_columns, graph_options){
    var $vm = this;
    $vm.resolved = false;
    $vm.proxies = [];
    $vm.opt_columns = [];
    $vm.graph_options = graph_options.get_options();
    $vm._graph_options_provider = graph_options;
    lum_proxies.then(function(proxies){
        $vm.resolved = true;
        $vm.proxies = proxies;
        $vm.opt_columns = opt_columns.filter(function(col){
            return proxies.some(function(p){ return p.opt[col.key]; }); });
    });
}

ProxiesTableController.prototype.$onDestroy = function(){
    this._graph_options_provider.release_options(); };

proxies.directive('proxiesTable', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl: '/proxies/proxies_table.html',
        controller: 'ProxiesTable',
        controllerAs: '$vm',
    };
});

});
