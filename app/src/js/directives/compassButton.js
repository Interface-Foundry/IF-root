app.directive('compassButton', function(worldTree, $templateRequest, $compile, userManager, $timeout) {
	return {
		restrict: 'EA',
		scope: true,
		link: function(scope, element, attrs) {
			var compassMenu;
			
			function positionCompassMenu() {
				if (scope.compassState == true) {
					var offset = element.offset();
					//@IFDEF WEB
					var topOffset = 4;
					//@ENDIF
					//@IFDEF PHONEGAP
					var topOffset = 19;
					//@ENDIF
					
					var newOffset = {top: topOffset, left: offset.left-compassMenu.width()+40};
					compassMenu.offset(newOffset);
				}
			}
			
			$templateRequest('templates/compassButton.html').then(function(template) {
				$compile(template)(scope, function(clonedElement) {
					compassMenu = $(clonedElement).appendTo(document.body);
					
					positionCompassMenu();
														
					scope.$watch(function () {
						return userManager.getDisplayName();
					}, function(newVal, oldVal) {
						positionCompassMenu();
					
					});
					
					$(window).resize(
						_.debounce(positionCompassMenu, 200)
					);
				})
			});			
			
			scope.compassOn = function($event, val) {
				console.log('compassOn');
				if (val!=undefined) {scope.compassState = val}
				if (val==true) {
					$timeout(positionCompassMenu, 0);
				}
				
				if ($event) {
					console.log('compassOn:event');

					$event.stopPropagation();
					$(document.body).on('click', function(e) {
						console.log('compassOn:html click');

						scope.compassState = false;
						scope.$digest();
						$(document.body).off('click');
					})
				}
				
			}
			
			console.log('linking compass button');
			worldTree.getNearby().then(function(data) {
				console.log('compassButton', data);
				scope.nearbyBubbles = data['150m'];
			}, function(reason) {console.log(reason)});
		}
	}
});