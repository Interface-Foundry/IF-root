'use strict';

app.factory('locationAnalyticsService', locationAnalyticsService);

locationAnalyticsService.$inject = ['$http', 'analyticsService'];

function locationAnalyticsService($http, analyticsService) {
    var locationBuffer = []; // array of any kind of location data
    var maxBufferSize = 3; // when to flush the buffer

    return {
        log: log,
        forceFlushBuffer: flushBuffer
    };

    /**
     * Log any sort of location analytics data
     * 
     * timestamp will be automatically added
     * 
     * var exampleLocationPoints = [
		 { type: "GPS", loc: [-74.2355365, 40.2354656], timestamp: 1427326245233 },
		 { type: "iBeacon", IDHash: "asdfafdasfasf", distance: 10, timestamp: 1427326245233},
		 { type; "AltBeacon", IDHash: "adfkasdfasf", distance: 10, timestamp: 1427326245233 }
		];
     * 
     * @param data the dat you want to log to the db
     */
    function log(data) {
		data.timestamp = Date.now();
		locationBuffer.push(data);
		if (locationBuffer.length == maxBufferSize) {
			flushBuffer();
		}
    }
    
    function flushBuffer() {
		analyticsService.log('geolocation.updates', locationBuffer);
		locationBuffer = [];
	}
}
