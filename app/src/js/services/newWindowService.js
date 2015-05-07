'use strict';

app.factory('newWindowService', newWindowService);

newWindowService.$inject = ['$window'];

// for opening phonegap links with inAppBrowser and web links in a new tab
function newWindowService($window) {

	return {
		go: go
	};

  function go(path) {
  	// @IFDEF PHONEGAP
  	// location=no will hide location bar on inAppBrowser but messes up web
    $window.open(path, '_blank', 'location=no,toolbarposition=top');
    // @ENDIF

    // @IFDEF WEB
    $window.open(path, '_blank');
    // @ENDIF
  }
}
