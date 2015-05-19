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
		var wrap;
		var nav;
		var banner;
		var home;
		var shelf;
		var routeListener;

		scope.closeBanner = closeBanner;
		scope.openApp = openApp;

		_.defer(activate);

		function activate() {
			wrap = angular.element('.wrap');
			nav = angular.element('.main-nav');
			banner = angular.element('#download-banner');
			home = angular.element('.home');
			shelf = angular.element('#shelf');

			setScroll(wrap);
			nav.addClass('banner-offset');
		}

		routeListener = $rootScope.$on('$routeChangeSuccess', function() {
			wrap.off('scroll');
			_.defer(function() {
				activate();
			});
		});

		function setScroll(el) {
			el.on('scroll', throttledScroll);
		}

		var throttledScroll = _.throttle(function() {
			var st = this.scrollTop;
			if (st > 0) {
				nav.removeClass('banner-offset');
				banner.removeClass('banner-offset');
				home.addClass('banner-adjust-up');
				shelf.addClass('banner-adjust-up');
			} else {
				nav.addClass('banner-offset');
				banner.addClass('banner-offset');
				home.removeClass('banner-adjust-up');
				shelf.removeClass('banner-adjust-up');
			}
		}, 100);

		function closeBanner() {
			$rootScope.showBanner = false;
			cleanup();
		}

		function cleanup() {
			nav.removeClass('banner-offset');
			home.addClass('banner-adjust-up');
			wrap.off('scroll', throttledScroll);
			routeListener();
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
