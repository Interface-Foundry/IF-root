'use strict';

app.controller('CategoryWidgetController', CategoryWidgetController);

CategoryWidgetController.$inject = ['$scope', 'bubbleSearchService'];

function CategoryWidgetController($scope, bubbleSearchService) {
	var vm = this;

	vm.bubbleId = $scope.world._id;
	vm.groupedCategories = _.groupBy($scope.categories, 'name');
	vm.search = search;

	function search(category, index) {
		bubbleSearchService.search(this.bubbleId, category);
	}
}