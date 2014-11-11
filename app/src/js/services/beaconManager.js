'use strict';

angular.module('tidepoolsServices')
    .factory('beaconManager', [ 'alertManager', '$interval', '$timeout',
    	function(alertManager, $interval, $timeout) {
//@IFDEF WEB
var beaconManager = {
	supported: false
}

return beaconManager;
//@ENDIF
	    	
//@IFDEF PHONEGAP
var alerts = alertManager;

var beaconManager = {
	updateInterval: 5000, //ms
	beacons: {},
	sessionBeacons: {},
	supported: true
}

beaconManager.startListening = function () {
	// start looking for beacons

	window.EstimoteBeacons.startRangingBeaconsInRegion(function () {
    //every now and then get the list of beacons in range
    $interval(function () {
        	window.EstimoteBeacons.getBeacons(function (data) {
            	//do something cool with the list of beacons
            	beaconManager.updateBeacons(data);
				console.log(data);
        }, 0, false);
    }, beaconManager.updateInterval);
});
}

beaconManager.updateBeacons = function(newBeacons) {
	angular.forEach(newBeacons, function(beacon) {
		var longID = getLongID(beacon);
		if (beaconManager.sessionBeacons[longID]) {
			console.log('already seen');
			//already seen 
		} else if (beacon) {
			//add it to session beacon
			
			//check distance
			
			//do something once
			beaconManager.beaconAlert(beacon);
			beaconManager.sessionBeacons[longID] = beacon;
		}
	});
/*
	var tempMap = {}, addedBeacons = [], removedBeacons = [];
	for (var i = 0, len = newBeacons.length; i < len; i++) {
		var temp = getLongID(newBeacons[i]);
		tempMap[temp] = newBeacons[i];
	}
	//REMOVE OLD BEACONS THAT ARE NO LONGER IN RANGE
	angular.forEach(beaconManager.beacons, function(beacon, longId) {
		if (Object.keys(tempMap).indexOf(longId) == -1) {
			removedBeacons.push(beacon);
		}
	});
	
	//ADD NEW BEACONS;
	angular.forEach(tempMap, function(beacon, longId) {
		if (Object.keys(beaconManager).indexOf(longId) == -1) {
			//not found in old beacon set
			addedBeacons.push(beacon);
		}
	});
	
	console.log('Beacons added:', addedBeacons);
	console.log('Beacons removed:', removedBeacons);
	
	beaconManager.beacons = tempMap;
*/
}

beaconManager.beaconAlert = function(beacon) {
	console.log('beaconAlert');
	
	$timeout(function() {
		alerts.notify({
			msg: 'Found a new landmark! Visit it now',
			href: 'profile'
		});
	});
}

beaconManager.beaconLookup = function(beacon) {
	return beaconData.getBeacon(beacon);
}

function getLongID(beacon) {
	return beacon.proximityUUID+beacon.major;
}


return beaconManager;

//@ENDIF
}]);

angular.module('tidepoolsServices')
    .factory('beaconData', [ 
    	function() {
var beaconData = {
	beaconTree: {
		'E3CA511F-B1F1-4AA6-A0F4-32081FBDD40D': {
			'28040': {
				name: 'Main Room A'
			},
			'28041': {
				name: 'Main Room B'
			},
			'28042': {
				name: 'Workshop Room A'
			},
			'28043': {
				name: 'Workshop Room B'
			}
		}
	}
}

beaconData.getBeacon = function(beacon) {
	return beaconData.beaconTree[beacon.proximityUUID][beacon.major];
}

return beaconData;

}]);
