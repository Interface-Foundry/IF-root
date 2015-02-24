app.directive('worldShelf', ['$document', 'apertureService','$rootScope','$location', function($document, apertureService,$rootScope,$location) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			// window.onpopstate = function(event) {
			// 	if (apertureService.state==='aperture-full') {
			// 		e.stopPropagation();
			// 		e.preventDefault();
			// 		scope.$apply(function() {
			// 			apertureService.toggle('full');
			// 		});
			// 	}	
			// }

			// DETECT KEYPRESS!!!!!!!!!!!!!!!!



			

		  //  $rootScope.$on('$locationChangeStart', function(event,next,current) {

		  //  		if (apertureService.state==='aperture-full') {

			 //   		if ($rootScope.watchPastLoc && $rootScope.watchPastLoc !== ''){ //we're not on first loaded page

				// 		console.log('next',next);
				// 		console.log('current',current);
				// 		console.log('watchpast',$rootScope.watchPastLoc);

				// 		if ($rootScope.watchPastLoc == next){ //detect switch to previous page

				// 			console.log('FIRING');
				// 			event.preventDefault();
				// 			apertureService.toggle('full');

				// 		}			
			 //   		}
			 //   		else {
						
			 //   		}
		  //  		}

				// $rootScope.watchPastLoc = current; //recording previous state before loc change

		  //   });      






		  //  $rootScope.$watch(function () {return $location.path()}, function (newLocation, oldLocation) {

		  //  		console.log('asdf!!!!');
				// if (apertureService.state==='aperture-full') {
				// 	closeMap();
				// }	
		  //   });

			// $document.on('keydown', function(e) {
			// 	if (e.keyCode===8 && apertureService.state==='aperture-full') {
			// 		closeMap();
			// 	}	
			// })

			// function closeMap(){
			// 	// e.stopPropagation();
			// 	// e.preventDefault();
			// 	scope.$apply(function() {
			// 		apertureService.toggle('full');
			// 	});
			// }

	

		}
	}
}]);