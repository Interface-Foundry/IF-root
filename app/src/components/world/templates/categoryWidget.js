app.directive('categoryWidget', [function() {
return {
	restrict: 'E',
	link: function(scope, element, attrs) {
		m.render(element[0], categoryWidget(scope.world.landmarkCategories));
		
		function categoryWidget(landmarkCategories) {
			return m('.marble-page.category-widget',
				landmarkCategories.map(categoryButton));
		}
		
		function categoryButton(landmarkCategory, index, landmarkCategories) {
			return m('button', {
				style: {width: 100 / landmarkCategories.length + '%'},
				onclick: emitCategory(landmarkCategory.name)
			}, landmarkCategory.name);
		}
		
		function emitCategory(landmarkCategoryName) {
			return function () {
				scope.$emit('landmarkCategoryChange', landmarkCategoryName)	
			}
		}
	}
}
}])