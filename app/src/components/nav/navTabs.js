app.directive('navTabs', ['$rootScope', '$routeParams', '$location', 'worldTree', '$document',  'apertureService', function($rootScope, $routeParams, $location, worldTree, $document, apertureService) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			scope.selected = 'home';
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
					// if in bubble, search takes you to search within bubble. else, search takes you general bubbl.li search
					if ($routeParams.worldURL) {
						apertureService.set('third');
						$location.path('/w/' + $routeParams.worldURL + '/search');
					}
				}
				scope.$emit('viewTabSwitch', tab);
			}

			scope.hardSearch = function() {
				$location.path('/');
				scope.$emit('viewTabSwitch', 'search');
			};
			
			// commented below out because it was complicating things. not sure why it's here (the specific functions should emit the viewTabSwitch)
			// scope.$on('$locationChangeSuccess', function(event, newValue, oldValue) {
			// 	scope.$emit('viewTabSwitch', 'home');
			// });
			
			$rootScope.$on('viewTabSwitch', function(event, tab) {
				scope.selected=tab;
			});
			
/*
			$document.on('keydown', function(e) {
				console.log('keydown', e, scope.selected)
			if (e.keyCode===8 && scope.selected !== 'home') {
				console.log('keycode 8 & selected not home')
				e.stopPropagation();
				e.preventDefault();
				scope.$apply(function() {
					scope.$emit('viewTabSwitch', 'home');
				});
			}
			});
*/
			
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
'<button class="view-tab search-tab" ng-class="{selected: selected==\'search\'}" single-click callback="select" vars="[\'search\']" ng-dblclick="hardSearch()"></button>'
	}
}])