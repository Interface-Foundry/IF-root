


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


            this.getNearbyRestaurants = function(address) {

                return new Promise((resolve, reject) => {
                    var final_uri = this.getURI().concat('/').concat(this.restaurantSearchEndpoint);                
                    var params = {'address': address };
                
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

            this.createDeliveryContext = function(address, fulfillment_type, team_id, team_admin_id) {

                return new Promise((resolve, reject) => {
                    var final_uri = this.getURI().concat('/').concat(this.contextEndpoint);                
                    var body = {'address': address, 'fulfillment_type': fulfillment_type, 'team_id': team_id, 'team_admin_id': team_admin_id };
                
                    request({
                        method: 'POST',
                        uri: final_uri, 
                        form: body
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


	        return this;
        }


};


module.exports = {
    'DSXClient': DSXClient
};