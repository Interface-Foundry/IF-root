'use strict';

app.factory('categoryWidgetService', categoryWidgetService);

categoryWidgetService.$inject = [];

function categoryWidgetService() {
	
	var selectedIndex = null;

	return {
		selectedIndex: selectedIndex
	}
	
}