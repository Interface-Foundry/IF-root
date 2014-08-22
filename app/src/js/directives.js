'use strict';

/* Directives */

angular.module('IF-directives', [])
.directive('myPostRepeatDirective', function() {

	
  return function(scope, element, attrs) {
    if (scope.$last){
      // iteration is complete, do whatever post-processing
      // is necessary
      var $container = $('#card-container');
	  // init
	  $container.isotope({
	    // options
	    itemSelector: '.iso-card'
	  });
    }
  };
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});