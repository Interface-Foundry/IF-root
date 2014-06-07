'use strict';

/* Directives */

angular.module('IF-directives', [])
.directive('myPostRepeatDirective', function() {

	console.log('asdf');
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
});

