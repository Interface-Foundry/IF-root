app.directive('navTabs', ['$rootScope', '$routeParams', '$location', 'worldTree', '$document',  'apertureService', 'navService', 'bubbleTypeService', function($rootScope, $routeParams, $location, worldTree, $document, apertureService, navService, bubbleTypeService) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.select = function (tab) {
				if (tab === 'home') {
					if ($routeParams.worldURL) {
						var wRoute = "/w/"+$routeParams.worldURL;
						$location.path() === wRoute ? $location.path("/") : $location.path(wRoute);

					} else {
						$location.path('/');
					}
				}
				else if (tab === 'search') {
					// if in retail bubble, search takes you to search within bubble. else, search takes you general bubbl.li search
					if ($routeParams.worldURL && bubbleTypeService.get() === 'Retail') {
						tab = 'searchWithinBubble';
						apertureService.set('third');
						$location.path('/w/' + $routeParams.worldURL + '/search');
					}
				}
				navService.show(tab);
			}

			scope.hardSearch = function() {
				$location.path('/');
				navService.show('search');
			};
			
			scope.nearbiesLength = function() {
				if (worldTree._nearby) {
					return _.reduce(worldTree._nearby, function(memo, value) {return memo+_.size(value)}, 0);
				} else {
					return 0;
				}
			}
		},
		template: 
'<button class="view-tab home-tab" ng-class="{selected: navService.status.home}" ng-click="select(\'home\')"></button>'+
'<button class="view-tab explore-tab" ng-class="{selected: navService.status.explore}" ng-click="select(\'explore\')">'+
'<span ng-show="nearbiesLength()>0" class="compass-badge badge" ng-cloak>{{nearbiesLength()}}</span></button>'+
'<button class="view-tab search-tab" ng-class="{selected: navService.status.search || navService.status.searchWithinBubble}" single-click callback="select" vars="[\'search\']" ng-dblclick="hardSearch()"></button>'
	}
}])