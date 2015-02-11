app.directive('drawer', ['worldTree', '$rootScope', '$routeParams', 'userManager', 'dialogs', function(worldTree, $rootScope, $routeParams, userManager, dialogs) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
scope._currentBubble = false;
	
$rootScope.$on('toggleDrawer', function() {
	scope.drawerOn = !scope.drawerOn;
});

scope.$on('$routeChangeSuccess', function() {
	//check if sharing and editing are available on this route
	scope._currentBubble = false;
	if ($routeParams.worldURL) {
		scope.shareAvailable = true;
	} else {
		scope.shareAvailable = false;
	}
})

scope.$watch('drawerOn', function(drawerOn, oldDrawerOn) {
	if (drawerOn === true) {
		element.addClass('drawer');	
	} else {
		element.removeClass('drawer');
	}
})

scope.currentBubble = function () {
	if (!scope._currentBubble && $routeParams.worldURL) {
		scope._currentBubble = worldTree.worldCache.get($routeParams.worldURL);
	}
	return scope._currentBubble;	
}

scope.avatar = function () {
	try {
		return userManager._user.avatar;
	}
	catch (e) {
		return undefined;
	}
}

scope.username = function () {
	return userManager.getDisplayName();
}

scope.userBubbles = function () {
	return worldTree._userWorlds;
}

scope.editAvailable = function () {
	try {
			return scope.currentBubble().permissions.ownerID === userManager._user._id;
	}
	catch (e) {
		return false;
	}
}

scope.closeDrawer = function() {
	scope.drawerOn = false;
}

scope.shareDialog = function() {
	dialogs.showDialog('shareDialog.html');
}

scope.create = worldTree.createWorld;

scope.feedback = function() {
	dialogs.showDialog('feedbackDialog.html')
}

scope.logout = userManager.logout;

		},
		templateUrl: 'components/drawer/drawer.html' 
	}
}])