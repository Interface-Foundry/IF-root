'use strict';

app.directive('downloadBanner', downloadBanner);

downloadBanner.$inject = ['$window'];

function downloadBanner($window) {
	return {
		restrict: 'E',
		templateUrl: 'components/download_banner/downloadBanner.html',
		scope: {

		},
		link: link
	};

	function link(scope, elem, attr) {
		scope.openApp = openApp;

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
