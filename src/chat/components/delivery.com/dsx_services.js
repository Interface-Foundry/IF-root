


"use strict";


var request = require('request');
var kip = require('kip');



class DSXClient{
        constructor(params) {           
	        this.host = params['host'];
	        this.port = params['port'];
	    
	        this.getURI = function(){
                return 'http://' + this.host + ':' + this.port;
	        }

            this.restaurantSearchEndpoint = 'restaurants';
            this.contextEndpoint = 'context';

            this._get = function(endpoint, request_params) {
                
                return new Promise((resolve, reject) => {
                    var final_uri = this.getURI().concat('/').concat(endpoint);                
                    var params = request_params;
                
                    request({
                        method: 'GET',
                        uri: final_uri, 
                        qs: params
                    },
                   function(error, response, body){                                              
                       if(!error && response.statusCode == 200) {
                           resolve(response.body);
                       }
                       else{
                           reject(error);
                       }
                       
                   });
                });
            }


            this._post = function(endpoint, request_body) {
                
                return new Promise((resolve, reject) => {
                    var final_uri = this.getURI().concat('/').concat(endpoint);                
                
                    request({
                        method: 'POST',
                        uri: final_uri, 
                        form: request_body
                    },
                   function(error, response, body){                                              
                       if(!error && response.statusCode == 200) {
                           resolve(response.body);
                       }
                       else{
                           reject(error);
                       }
                       
                   });
                });
            }

            
            this.getNearbyRestaurants = function(address) {
                return this._get(this.restaurantSearchEndpoint, {'address': address })               
            }

            this.createDeliveryContext = function(address, fulfillment_type, team_id, team_admin_id) {                
                var request_body = {'address': address, 'fulfillment_type': fulfillment_type, 'team_id': team_id, 'team_admin_id': team_admin_id };
                return this._post(this.contextEndpoint, request_body);
            }

	        return this;
        }


};


module.exports = {
    'DSXClient': DSXClient
};