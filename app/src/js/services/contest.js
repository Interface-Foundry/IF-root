app.factory('contest', ['$http', 'localStore', function($http, localStore) {
	// manages want this got this contest

	var isContest = false; // determines whether or not a process involves the wtgt contest
	var hashtag;
	var id;
	var startTime;

	return {
		set: set,
		login: login,
		close: close
	}

	function set(setID, setHashtag) {
		isContest = true;
		id = setID;
		hashtag = setHashtag;
		startTime = new Date();
	}

	function login(endTime) {
		// call if user logs in after login prompt on photo upload (wtgt)
		// tracking login by logging in (userManager.login.login) or clicking "create account" on auth dialog
		if (isContest) {
			timeDuration = getTimeDuration(startTime, endTime);
			var data = {
				anonID: id,
				selectedUploadType: hashtag,
				signedUp: true,
				userTimeDuration: timeDuration
			}
			$http.post('/api/anon_user/update', data).
				success(function(data) {
					// console.log('success: ', data);
				}).
				error(function(data) {
					// console.log('error: ', data);
				});
			reset();
		}
	}

	function close(endTime) {
		// call if user closes modal after login prompt on photo upload (wtgt)
		if (isContest) {
			var response;
			timeDuration = getTimeDuration(startTime, endTime);
			var data = {
				anonID: id,
				selectedUploadType: hashtag,
				closedNoLogin: true,
				userTimeDuration: timeDuration
			}
			$http.post('/api/anon_user/update', data).
				success(function(data, status, headers, config) {
					response = data[0];
					// console.log('response: ', response);
				}).
				error(function(data, status, headers, config) {
					// console.log('error: ', data);
				});
			compare(response, id);
			reset();
		}
	}

	function reset() {
		isContest = false;
		id = null;
		hashtag = null;
		startTime = null;
	}

	function getTimeDuration(start, end) {
		var start = start.getTime();
		var end = end.getTime();
		return end - start; // in ms
	}

	function compare(response, id) {
		// if the id returned from api is different from id passed into api, then update the id
		if (response && response!== id) {
			localStore.setID(response);
		}
	}

}]);