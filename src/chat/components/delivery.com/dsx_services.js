


"use strict";


class DSXClient{

        constructor(params) {           
	        this.host = params['host'];
	        this.port = params['port'];
	    

	        this.getURI = function(){
                return 'http://' + this.host + ':' + this.port;
	        }

	        return this;
        }


};


module.exports = {
    'DSXClient': DSXClient
};