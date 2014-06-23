//parent
function WorldMakerCtrl($location, $scope, $routeParams, db, $rootScope) {
	$scope.fields = [
		{placeholder: 'World Name', inputType: 'text', isRequired: true},
		{placeholder: 'Picture', inputType: 'picture', isRequired: true},
		{placeholder: 'Summary', inputType: 'text', isRequired: false},
		{placeholder: 'Description', inputType: 'text', isRequired: false},
		{placeholder: 'Hashtag', inputType: 'text', isRequired: false},
		{placeholder: 'Category', inputType: 'text', isRequired: false}
	]; 
	
	$scope.submitForm = function() {
		alert("it works");
		
	};
}