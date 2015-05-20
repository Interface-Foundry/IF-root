'use strict';

app.directive('downloadBanner', downloadBanner);

downloadBanner.$inject = ['$window', '$rootScope', 'apertureService'];

function downloadBanner($window, $rootScope, apertureService) {
	return {
		restrict: 'E',
		templateUrl: 'components/download_banner/downloadBanner.html',
		scope: {
			aperture: '=aperture'
		},
		link: link
	};

	function link(scope, elem, attr) {
		var nav = angular.element('.main-nav');
		var wrap;
		var banner;
		var viewContainer;
		var apertureWatch
		var routeListener;
		
		nav.addClass('banner-offset');

		scope.aperture = apertureService;
		scope.closeBanner = closeBanner;
		scope.openApp = openApp;

		apertureWatch = scope.$watch('aperture.state', function(newVal, oldVal) {
			if (newVal === 'aperture-full') {
				hideBanner();
			}
		});

		_.defer(activate);

		function activate() {
			wrap = angular.element('.wrap');
			banner = angular.element('#download-banner');
			viewContainer = angular.element('#view-container');
			setScroll(wrap);
		}

		routeListener = $rootScope.$on('$routeChangeSuccess', function() {
			if (wrap) {
				wrap.off('scroll');
			}
			_.defer(function() {
				activate();
				showBanner();
			});
		});

		function setScroll(el) {
			el.on('scroll', throttledScroll);
		}

		var throttledScroll = _.throttle(function() {
			var st = this.scrollTop;
			if (st > 0) {
				hideBanner();
			} else {
				showBanner();
			}
		}, 100);

		function closeBanner() {
			$rootScope.showBanner = false;
			cleanup();
		}

		function cleanup() {
			nav.removeClass('banner-offset');
			wrap.off('scroll', throttledScroll);
			routeListener();
			apertureWatch();
		}


		function hideBanner() {
			viewContainer.css('height', '100vh');
			viewContainer.css('margin-top', '-80px');
			nav.removeClass('banner-offset');
			banner.removeClass('banner-offset');
			banner.removeClass('banner-adjust-up');
		}

		function showBanner() {
			var screenHeight = window.screen.height;
			viewContainer.css('height', screenHeight - 80 + 'px');
			viewContainer.css('margin-top', '0px');
			nav.addClass('banner-offset');
			banner.addClass('banner-offset');
		}


		// TODO check if app is installed on device
		// https://github.com/philbot5000/CanOpen
		// if yes, open app. if no, open link to app store
		function openApp() {
			$window.open('http://goo.gl/Lw6S3V');
		}

	}
}
