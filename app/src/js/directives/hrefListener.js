'use strict';

app
.directive('hrefListener', hrefListener);

hrefListener.$inject = ['newWindowService'];

function hrefListener(newWindowService) {	
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
        newWindowService.go(element.href);
        return false;
      }
    });
    // @ENDIF
  }
}