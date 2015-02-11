app.directive('navTabs', ['$rootScope', '$routeParams', '$location', 'worldTree', function($rootScope, $routeParams, $location, worldTree) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.selected = 'home';
			scope.select = function (tab) {
				if (scope.selected===tab && tab === 'home') {
					if ($routeParams.worldURL) {
						var wRoute = "/w/"+$routeParams.worldURL;
						$location.path() === wRoute ? $location.path("/") : $location.path(wRoute);

					} else {
						$location.path('/');
					}
				}
				scope.$emit('viewTabSwitch', tab);
			}
			
			scope.$on('$locationChangeSuccess', function(event) {
				scope.$emit('viewTabSwitch', 'home');
			});
			
			$rootScope.$on('viewTabSwitch', function(event, tab) {
				scope.selected=tab;
			});
			
			
			scope.nearbiesLength = function() {
				if (worldTree._nearby) {
					return _.reduce(worldTree._nearby, function(memo, value) {return memo+_.size(value)}, 0);
				} else {
					return 0;
				}
			}
		},
		template: 
'<button class="view-tab home-tab" ng-class="{selected: selected==\'home\'}" ng-click="select(\'home\')"></button>'+
'<button class="view-tab explore-tab" ng-class="{selected: selected==\'explore\'}" ng-click="select(\'explore\')">'+
'<span ng-show="nearbiesLength()>0" class="compass-badge badge" ng-cloak>{{nearbiesLength()}}</span></button>'+
'<button class="view-tab search-tab" ng-class="{selected: selected==\'search\'}" ng-click="select(\'search\')"></button>'
	}
}])