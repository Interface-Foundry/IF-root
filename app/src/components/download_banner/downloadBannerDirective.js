'use strict';

app.directive('downloadBanner', downloadBanner);

downloadBanner.$inject = ['$window', '$rootScope'];

function downloadBanner($window, $rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'components/download_banner/downloadBanner.html',
		scope: {

		},
		link: link
	};

	function link(scope, elem, attr) {
		scope.closeBanner = closeBanner;
		scope.openApp = openApp;

		elem.on('scroll', function(e) {
			console.log(this.scrollTop)
		})

		function closeBanner() {
			$rootScope.showBanner = false;
		}

		// this does not work yet. possible option: https://github.com/philbot5000/CanOpen
		function openApp() {
			try {
				console.log('trying co.kipapp://')
				$window.open('co.kipapp://');
			}
			catch(err) {
				console.log('Caught error', err)
				// $location.path()
			}
		}
		
	}
}
