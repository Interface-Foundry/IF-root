// @IFDEF WEB

'use strict';

app.directive('downloadBanner', downloadBanner);

downloadBanner.$inject = ['$window', '$rootScope', 'apertureService', 'deviceManager'];

function downloadBanner($window, $rootScope, apertureService, deviceManager) {
	return {
		restrict: 'E',
		templateUrl: 'components/download_banner/downloadBanner.html',
		scope: {},
		link: link
	};

	function link(scope, elem, attr) {
		var nav = angular.element('.main-nav');
		var wrap;
		var banner;
		var routeLoadingIndicators;
		var viewContainer;
		var apertureWatch
		var routeListener;
		
		// to prevent a fast double click on the splash screen and open up app store
		var delayButtonPress = true;
		setTimeout(function() {
			delayButtonPress = false;
		}, 1000);

		scope.aperture = apertureService;
		scope.closeBanner = closeBanner;
		scope.device = deviceManager.os;
		scope.openApp = openApp;

		if (!isBannerAppropriate()) {
			closeBanner();
			return;
		}
		nav.addClass('banner-offset');
		// navbar animation is deferred so the inital starting point does not animate
		_.defer(function() {
			setNavbarAnimation();
		});

		apertureWatch = scope.$watch('aperture.state', function(newVal, oldVal) {
			if (newVal === 'aperture-full') {
				hideBanner();
			}
		});

		_.defer(activate);

		function activate() {
			wrap = angular.element('.wrap');
			banner = angular.element('#download-banner');
			routeLoadingIndicators = angular.element('.routeLoading');
			viewContainer = angular.element('#view-container');
			setScroll(wrap);
			routeLoadingIndicators.addClass('banner-offset');
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

		function setNavbarAnimation() {
			nav.addClass('nav-animations');
		}

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
			nav.removeClass('nav-animations');
			nav.removeClass('banner-offset');
			if (routeLoadingIndicators) {
				routeLoadingIndicators.removeClass('banner-offset');
			}
			if (wrap) {
				wrap.off('scroll', throttledScroll);
				routeListener();
				apertureWatch();
			}
		}


		function hideBanner() {
			viewContainer.css('height', '100vh');
			viewContainer.css('margin-top', '-80px');
			nav.removeClass('banner-offset');
			banner.removeClass('banner-offset');
			routeLoadingIndicators.removeClass('banner-offset');
		}

		function isBannerAppropriate() {
			if (scope.device === 'ios' || scope.device === 'android') {
				return true;
			}
			return false;
		}

		function showBanner() {
			var screenHeight = window.screen.height;
			viewContainer.css('height', screenHeight - 80 + 'px');
			viewContainer.css('margin-top', '0px');
			nav.addClass('banner-offset');
			banner.addClass('banner-offset');
			routeLoadingIndicators.addClass('banner-offset');
		}


		// TODO check if app is installed on device
		// https://github.com/philbot5000/CanOpen
		// if yes, open app. if no, open link to app store
		function openApp() {
			if (delayButtonPress) {
				return;
			}
			if (scope.device === 'ios') {
				$window.open('http://goo.gl/Lw6S3V');
			} else if (scope.device === 'android') {
				$window.open('http://play.google.com/store/apps/details?id=com.ifpbc.kip');
			}
		}

	}
}
// @ENDIF