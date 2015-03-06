app.directive('categoryWidgetSr', categoryWidgetSr);

categoryWidgetSr.$inject = ['bubbleSearchService'];

function categoryWidgetSr(bubbleSearchService) {
	return {
		restrict: 'E',
		scope: {
			categories: '=categories',
			style: '=style',
			world: '=world'
		},
		templateUrl: 'components/world/category_widget/category.widget.html',
		controller: function($scope) {
			$scope.groupedCategories = _.groupBy($scope.categories, 'name');

			$scope.search = function(index) {
				var category = this.category[0].name;
				bubbleSearchService.search($scope.world._id, category);
			}
		}
			
	};
}