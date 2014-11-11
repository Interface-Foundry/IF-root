'use strict';

/* Services */

var res;

angular.module('tidepoolsServices', ['ngResource'])

	.factory('Landmark', ['$resource', '$http',
        function($resource, $http) {
			var actions = {
                'count': {method:'PUT', params:{_id: 'count'}, server: true},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}, server: true},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:false, server: true}
            }
            res = $resource('/api/landmarks/:_id:id', {}, actions);
            return res;
        }
    ])

    .factory('World', ['$resource', '$http', 'leafletData', 
        function($resource, $http, leafletData) {
            var actions = {
                'count': {method:'PUT', params:{_id: 'count'}, server: true},                           
                'distinct': {method:'PUT', params:{_id: 'distinct'}, server: true},      
                'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                'del': {method:'DELETE', params:{_id: 'del'}, isArray:true, server: true},
                'get': {method: 'GET', server: true}
            }
            res = $resource('/api/worlds/:_id:id', {}, actions);
            return res;
        }
    ])
    .factory('db', ['$resource', '$http',    
        function($resource, $http) {
    		var actions = {
                    'count': {method:'PUT', params:{_id: 'count', server: true}},                           
                    'distinct': {method:'PUT', params:{_id: 'distinct', server: true}},      
                    'find': {method:'PUT', params:{_id: 'find'}, isArray:true, server: true},              
                    'group': {method:'PUT', params:{_id: 'group'}, isArray:true, server: true},            
                    'mapReduce': {method:'PUT', params:{_id: 'mapReduce'}, isArray:true, server: true},  
                    'aggregate': {method:'PUT', params:{_id: 'aggregate'}, isArray:true, server: true},
                    'create':  {method:'POST', params:{_id: 'create'}, isArray:true, server: true},
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true, server: true},
                    'query':  {method:'GET', isArray:true, server: true},
                }
            var db = {};
            db.worlds = $resource('/api/worlds/:_id', {}, actions);
            db.landmarks = $resource('/api/landmarks/:_id:id', {}, actions);
            db.styles = $resource('/api/styles/:_id', {}, actions);
            db.projects = $resource('/api/projects/:_id', {}, actions);
            db.tweets = $resource('/api/tweets/:_id', {}, actions);
            db.instagrams = $resource('/api/instagrams/:_id', {}, actions);
            db.messages = $resource('/api/worldchat/:_id', {}, actions);
            db.visit = $resource('/api/visit/:_id', {}, actions);
            return db;
        }
    ])
    .factory('apertureService', ['leafletData','mapManager',
    	function(leafletData,mapManager) {
	    	var aperture = {
				off: true,
				state: 'aperture-off',
				navfix:  'navfix'
	    	}
	    	var map = mapManager;
	    	
	    	
	    	aperture.toggle = function(state) {
	    		if (aperture.state != 'aperture-full')  {
		    			aperture.off = false;
		    			console.log('toggling aperture on');
		    			aperture.navfix = '';
						if (state == 'half') {
						aperture.set('half');
						}
						if (state == 'full') {
						aperture.set('full');
						}
				} else {
					console.log('off');
					aperture.off = true;
					aperture.state = 'aperture-off';
					aperture.navfix = 'navfix';
				}
				
			
			}
			
			aperture.set = function(state) {
				switch (state) {
					case 'off':
						aperture.off = true;
						aperture.state = 'aperture-off';
						aperture.navfix = 'navfix';
						map.apertureUpdate('aperture-off');
						break;
					case 'third': 
						aperture.off = false;
						aperture.state = 'aperture-third';
						aperture.navfix = '';
						map.apertureUpdate('aperture-third');
						break;
					case 'half':
						aperture.off = false;
						aperture.state = 'aperture-half';
						aperture.navfix = '';
						map.apertureUpdate('aperture-half');
						break;
					case 'full':
						aperture.off = false;
						aperture.state = 'aperture-full';
						aperture.navfix = '';
						map.apertureUpdate('aperture-full');
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