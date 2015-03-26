'use strict';

app.factory('analyticsService', analyticsService);

analyticsService.$inject = ['$http', '$injector'];

function analyticsService($http, $injector) {
    var sequenceNumber = 0;
    var geoService; // lazy loaded to avoid circ dependency

    return {
        log: log
    };

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

        geoService.getLocation().then(function(coords) {

            var doc = {
                action: action,
                data: data,
                userTimestamp: Date.now(),
                sequenceNumber: sequenceNumber,
                loc: {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat]
                }
            };

            // dude trust me, this is gonna work. no need for a response
            $http.post('/api/analytics/' + action, doc);
        });
    }
}
