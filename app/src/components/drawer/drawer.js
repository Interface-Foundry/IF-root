app.directive('drawer', ['worldTree', '$rootScope', '$routeParams', 'userManager', 'dialogs', function(worldTree, $rootScope, $routeParams, userManager, dialogs) {
	return {
		restrict: 'EA',
		scope: true,
		link: function (scope, element, attrs) {
//would prefer if this method of bubble checking was replaced with an event bus (ie instead of depending on worldURL
//can just watch for events on new bubble viewing. Or make a more centralized model)
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
}) //keeps shareavailable and editavailable up to date on route watching

scope.$watch('drawerOn', function(drawerOn, oldDrawerOn) {
	if (drawerOn === true) {
		element.addClass('drawer');	
	} else {
		element.removeClass('drawer');
	}
}) //toggles drawer

scope.currentBubble = function () {
	if (!scope._currentBubble && $routeParams.worldURL) {
		scope._currentBubble = worldTree.worldCache.get($routeParams.worldURL);
	}
	return scope._currentBubble;	
} 
//weird hack to expose current bubble on scope

scope.avatar = function () {
	try {
		return userManager._user.avatar;
	}
	catch (e) {
		return undefined;
	}
}
//mirroring avatar on directive scope

scope.username = function () {
	return userManager.getDisplayName();
}
//^^


scope.userBubbles = function () {
	return worldTree._userWorlds;
}
//exposes current userworlds on scope

scope.editAvailable = function () {
	try {
			return scope.currentBubble().permissions.ownerID === userManager._user._id;
	}
	catch (e) {
		return false;
	}
}
//check if user can edit. 

scope.closeDrawer = function() {
	scope.drawerOn = false;
}

scope.shareDialog = function() {
	dialogs.showDialog('shareDialog.html');
}
//pop up share dialog

scope.create = worldTree.createWorld;
//alias createworld on drawer

scope.feedback = function() {
	dialogs.showDialog('feedbackDialog.html')
}
//show feedback

scope.logout = userManager.logout;
//alias logout

		},
		templateUrl: 'components/drawer/drawer.html' 
	}
}])