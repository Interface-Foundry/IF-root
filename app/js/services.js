'use strict';

/* Services */

var res;

angular.module('tidepoolsServices', ['ngResource'])

	.factory('Landmark', ['$resource', '$http',
        function($resource, $http) {
			var actions = {
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true}
            }
            res = $resource('api/landmarks/:_id:id', {}, actions);
            return res;
        }
    ])

    .factory('World', ['$resource', '$http', 'leafletData', 
        function($resource, $http, leafletData) {
            var actions = {
                'count': {method:'PUT', params:{_id: 'count'}},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true}
            }
            res = $resource('api/worlds/:_id:id', {}, actions);
            return res;
        }
    ])
    .factory('db', ['$resource', '$http',    
        function($resource, $http) {
    		var actions = {
                    'count': {method:'PUT', params:{_id: 'count'}},                           
                    'distinct': {method:'PUT', params:{_id: 'distinct'}},      
                    'find': {method:'PUT', params:{_id: 'find'}, isArray:true},              
                    'group': {method:'PUT', params:{_id: 'group'}, isArray:true},            
                    'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true},  
                    'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true},
                    'create':  {method:'POST', params:{_id: 'create'}, isArray:true},
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true}
                }
            var db = {};
            db.worlds = $resource('api/worlds/:_id', {}, actions);
            db.landmarks = $resource('api/landmarks/:_id:id', {}, actions);
            db.styles = $resource('api/styles/:_id', {}, actions);
            db.projects = $resource('api/projects/:_id', {}, actions);
            db.tweets = $resource('api/tweets/:_id', {}, actions);
            db.instagrams = $resource('api/instagrams/:_id', {}, actions);
            return db;
        }
    ])
    .factory('apertureService', ['leafletData', 'mapManager', 
    	function(leafletData, mapManager) {
	    	var aperture = {};
			aperture.off = true;
	    	aperture.state = 'aperture-off';
	    	aperture.navfix = 'navfix';
	    	var map = mapManager;
	    	
	    	aperture.toggle = function(state) {
	    		if (aperture.off)  {
		    			aperture.off = false;
		    			console.log('toggling aperture on');
		    			aperture.navfix = '';
						if (state == 'half') {
						console.log('half');	
						aperture.state = 'aperture-half';
						}
						if (state == 'full') {
						console.log('full');
							aperture.state = 'aperture-full';
						}
				} else {
				console.log('off');
					aperture.off = true;
					aperture.state = 'aperture-off';
					aperture.navfix = 'navfix';
				}
				
				/*if ($rootScope.apertureOn) {
					//open
					console.log('opening');
					angular.extend($rootScope, {apertureSize: h});
					console.log($rootScope.apertureSize);
				} else { 
					console.log('closing aperture');
					angular.extend($rootScope, {apertureSize: 0});
					console.log($rootScope.apertureSize);
				}*/
				map.refresh();
			}
			
			aperture.set = function(state) {
				switch (state) {
					case 'off':
						aperture.off = true;
						aperture.state = 'aperture-off';
						aperture.navfix = 'navfix';
						break;
					case 'half':
						aperture.off = false;
						aperture.state = 'aperture-half';
						aperture.navfix = '';
						break;
					case 'full':
						aperture.off = false;
						aperture.state = 'aperture-full';
						aperture.navfix = '';
						break;
				}
				}
			
			return aperture;
    }])

    // .service('mapper', ['$scope', function($scope) {
            
    //         this.view = function() {
    //             //console.log('MAP');
    //             angular.extend($scope, {
    //                 center: {
    //                     lat: 42.356810,
    //                     lng: -83.0610023,
    //                     zoom: 14
    //                 }
    //             });
    //         }
            
    //     }
    // ]);


    // .factory('map', ['$resource', '$http',    
    //     function(type,filter) {
    //        console.log("asdf")
    //     }
    // ]);


    // .factory('map', function(type,filter) {

    //     console.log(type,filter);

    // });

	//handling alerts
   .factory('alertManager', [function () {
   		var alerts = {
   			'list':[]
   		};

   		alerts.addAlert = function(alertType, alertMsg) {
   			alerts.list = []; //clear alerts automatically for now to show one
   			alerts.list.push({type: alertType, msg: alertMsg});
   		}

   		alerts.closeAlert = function(index) {
   			alerts.list.splice(index, 1);
   		}

   		return alerts;
   }])

   //socket connection
	.factory('socket', function ($rootScope) {
	  var socket = io.connect();
	  return {
	    on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
	  };
	});