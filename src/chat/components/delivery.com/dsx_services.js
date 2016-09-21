


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


	        return this;
        }


};


module.exports = {
    'DSXClient': DSXClient
};