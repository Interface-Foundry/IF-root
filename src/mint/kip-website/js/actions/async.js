export const get = (url, type) => async dispatch => {
	try {

	  	const response = await fetch(url, {
	    	credentials: 'same-origin'
	  	});


	  	const json = await response.json();
		
		debugger
		dispatch({
			type: `${type}_SUCCESS`,
			response: json,
			receivedAt: Date.now()
		});

	} catch (e) {
	 	 throw 'error in session update';
	}
};