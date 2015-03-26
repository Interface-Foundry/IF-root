'use strict';

app.factory('analyticsService', analyticsService);

analyticsService.$inject = ['$http', '$injector', '$rootScope', '$timeout', 'localStore', '$location'];

function analyticsService($http, $injector, $rootScope, $timeout, localStore, $location) {
    var sequenceNumber = 0;
    var geoService; // lazy loaded to avoid circ dependency
    var userManager; // ditto

    /**
     * Log any sort of analytics data
     * @param action string name of the action, can be dot-separated or whatever you think is easy to search
     *      ex "geolocation.update" or "search.keyword" or "search.category"
     * @param data the dat you want to log to the db
     */
    function log(action, data) {
        sequenceNumber++; // update this global sequence number every time something interesting happens
		if (typeof geoService === 'undefined') {
			geoService = $injector.get('geoService');
		}
		if (typeof userManager === 'undefined') {
			userManager = $injector.get('userManager');
		}
		
		var doc = {
			action: action,
			data: data,
			userTimestamp: Date.now(),
			sequenceNumber: sequenceNumber,
            anon_user_id: localStore.getID()
		};

		geoService.getLocation().then(function(coords) {
			doc.loc = {
				type: "Point",
				coordinates: [coords.lng, coords.lat]
			};
			
			return userManager.getUser();
		}).then(function(user) {
			doc.user = user._id;
		}).finally(function() {
			// dude trust me, this is gonna work. no need for a response
			$http.post('/api/analytics/' + action, doc);
		});
    }
    
    // log all route changes to teh db
    $rootScope.$on('$routeChangeSuccess', function(event, url) {
		
		// wait until render finishes
		$timeout(function() {
			
			// the main shelf scope has all the interesting stuff
			var scope = angular.element('#shelf').scope() || {};
			var world = (scope.world && scope.world._id) ? {
					_id: scope.world._id,
					category: scope.world.categor,
					loc: scope.world.loc
				} : null;
			log('route.change', {
				url: $location.absUrl(),
				world: world
			});
		});
	});
    
    return {
        log: log
    };
}
