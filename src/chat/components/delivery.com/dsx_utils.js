
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
	    soSegment = this.yamlDoc['service_objects'];
	    initData = module.exports.verifyPresent(soSegment[serviceObjectName], serviceObjectName);
	    if(initData['init_params'] === null || initData['init_params'] === undefined){
		return {};
	    }
	    return initData['init_params'];
	};
	
	return this;
    }

};
