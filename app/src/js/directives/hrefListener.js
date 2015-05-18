'use strict';

app
.directive('hrefListener', hrefListener);

hrefListener.$inject = ['$location', 'newWindowService', 'navService'];

/***
 *  User generated html that includes links (world descriptions, tweets, etc)
 *  will break phonegap by opening a link in the webview with no way to return.
 *  This directive listens for clicks on elements that could contain links.
 *  On mobile it will force the link to open in the InAppBrowser so users can return to the app.
 */
function hrefListener($location, newWindowService, navService) {	
  return {
    restrict: 'A',
    link: link
  };

  function link(scope, elem, attrs) {
    // @IFDEF WEB
    return;
    // @ENDIF

    // @IFDEF PHONEGAP
    elem.bind('click', function (e) {
      e = e ||  window.event;
      var element = e.target || e.srcElement;

      if (element.tagName == 'A') {
        if (isOutsideLink(element.href)) {
          newWindowService.go(element.href);
          return false;
        } else {
          // translate relative url to mobile safe format
          var path = element.href.split('file:///')[1];
          $location.path(path);
        }
      }
    });
    // @ENDIF
  }

  function isOutsideLink(link) {
    var httpExp = /(ftp|http|https)/i;
    return httpExp.test(link);
  }
}