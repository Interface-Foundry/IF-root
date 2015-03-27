'use strict';

app.factory('locationAnalyticsService', locationAnalyticsService);

locationAnalyticsService.$inject = ['$http', '$interval', 'analyticsService', 'localStore'];

function locationAnalyticsService($http, $interval, analyticsService, localStore) {
    var locationBuffer = []; // array of any kind of location data
    var maxBufferSize = 1000; // when to flush the buffer
    var maxBufferAge = 60*1000; // flush every so often
    
    // use localstorage if they have it    
	if (typeof localStorage !== 'undefined') {
		try {
			locationBuffer = JSON.parse(localStorage.getItem("locationBuffer"));
		}
		catch (e) {
			locationBuffer = [];
			localStorage.setItem("locationBuffer", "[]");
		}
		
		if (!locationBuffer) {
			locationBuffer = [];
		}
	}

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
      localStore.locationBuffer.push(data);
      if (localStore.locationBuffer.getLength == maxBufferSize) {
	flushBuffer();
      }
    }
    
    function flushBuffer() {
      var locationBuffer = localStore.locationBuffer.flush();
		
      if (locationBuffer.length > 0) {
	  analyticsService.log('geolocation.updates', locationBuffer);
      }
      
    }
    
  $interval(function() {
	  flushBuffer();
  }, maxBufferAge);
    
  return {
    log: log,
    forceFlushBuffer: flushBuffer
  };
}
