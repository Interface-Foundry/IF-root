app.directive('progressCircle', function() {
	return {
		restrict: 'EA',
		scope: {
			top: '=',
			left: '=',
			fullWidth: '=',
			spinLeft: '=',
			spinLeftLong: '='
		},
		templateUrl: 'templates/progressCircle.html',
		controller: function($scope) {
			$scope.style = function() {
				return {
					'top': $scope.top + 'px',
					'left': $scope.left + 'px',
					'width': $scope.fullWidth + 'px',
					'height': $scope.fullWidth + 'px',
					'clip': getClip($scope.spinLeft, $scope.spinLeftLong, $scope.fullWidth)
				};
			};

			$scope.styleClip = {
				'clip': 'rect(0px,' + $scope.fullWidth/2 + 'px,' + $scope.fullWidth + 'px,' + '0px)'
			};

			var getClip = function(spinLeft, spinLeftLong, fullWidth) {
				var clipNone = 'rect(auto, auto, auto, auto)';
				var clipAll = 'rect(0px, 0px, 0px, 0px)';
				var clipLeft = 'rect(0px,' + fullWidth + 'px,' + fullWidth + 'px,' + (fullWidth/2) + 'px)';

				if (spinLeft && spinLeftLong) return clipNone;
				else if (!spinLeft && !spinLeftLong) return clipAll;
				else return clipLeft; // default
			}
		}
	};
});