'use strict';

app.factory('welcomeService', welcomeService);

function welcomeService() {
	var needsWelcome = false;

	return {
		needsWelcome: needsWelcome
	}
}