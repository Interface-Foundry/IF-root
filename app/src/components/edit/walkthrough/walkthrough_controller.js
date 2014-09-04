function WalkthroughController($scope) {
	$scope.progress = new Array(10).fill({test: 'test'}, 0, 10);
	console.log($scope.progress);

	$scope.walk = {
		title: 'something',
		caption: 'what',
		length: 7,
		position: 0
	}
}