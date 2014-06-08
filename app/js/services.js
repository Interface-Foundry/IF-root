'use strict';

/* Services */

//let's get mongo data
//from: https://github.com/dalcib/angular-phonecat-mongodb-rest
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
                    'locsearch':  {method:'GET', params:{_id: 'locsearch'}, isArray:true},
                }
            var db = {};
            db.worlds = $resource('api/worlds/:_id', {}, actions);
            db.landmarks = $resource('api/landmarks/:_id:id', {}, actions);
            db.tweets = $resource('api/tweets/:_id', {}, actions);
            db.instagrams = $resource('api/instagrams/:_id', {}, actions);
            return db;
        }
    ]);

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

