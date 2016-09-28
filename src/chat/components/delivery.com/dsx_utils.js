
module.exports = {


    verifyPresent: function(obj, name) {
	if(obj === undefined || obj === null){
	    throw new Error('Lookup of ' + name + 'failed.');
	}
	return obj;
    },
    
    ServiceObjectLoader: function(yamlDoc) {
	this.yamlDoc = yamlDoc;	

	this.loadServiceObjectParams = function(serviceObjectName) {
	    var soSegment = this.yamlDoc['service_objects'];
	    var initData = module.exports.verifyPresent(soSegment[serviceObjectName], serviceObjectName);
	    if(initData['init_params'] === null || initData['init_params'] === undefined){
		    return {};
	    }

        console.log(initData);
	    return initData['init_params'];
	};
	
	return this;
    }

};
