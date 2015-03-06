app.directive('categoryWidgetSr', [function() {
	return {
		restrict: 'E',
		scope: {
			categories: '=categories',
			style: '=style'
		},
		templateUrl: 'components/world/category_widget/category.widget.html',
		link: function(scope, element, attrs) {
			scope.groupedCategories = _.groupBy(scope.categories, 'name');
		}
	}
}]);