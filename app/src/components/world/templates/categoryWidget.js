app.directive('categoryWidget', [function() {
return {
	restrict: 'E',
	link: function(scope, element, attrs) {
		scope.$watchGroup(['world.landmarkCategories', 'selectedCategory'], function (newValues, oldValues) {
			m.render(element[0], categoryWidget(scope.world.landmarkCategories));
		})
		
		function categoryWidget(landmarkCategories) {
			return m('.category-widget', 
				groupCategories(landmarkCategories))
		}
		
		function groupCategories(landmarkCategories) {
			if (landmarkCategories.length < 4) {
				return buttonGroup(landmarkCategories); //3x1 grid
			} else if (landmarkCategories.length === 4) { //2x2 grid
				return [
					buttonGroup(landmarkCategories.slice(0, 2)),
					buttonGroup(landmarkCategories.slice(2))
				]
			} else { 
				return [ //3x2, 3x3 grid
					buttonGroup(landmarkCategories.slice(0, 3)),
					buttonGroup(landmarkCategories.slice(3))
				]
			}
		}
		
		function buttonGroup(categoryList) {
			return m('.category-btn-group', categoryList.map(categoryButton));
		}
		
		function categoryButton(category, index, categoryList) {
			return m('.category-btn', {
				style: {width: 100 / categoryList.length + '%'},
				colspan: 6/categoryList.length,
				onclick: emitCategory(category.name),
				class: scope.selectedCategory === category.name ? 'selected-category' : null
			}, [
			category.avatar ? m('img.category-btn-img', {src: category.avatar}) : null,
			category.name]);
		}
		
		function emitCategory(landmarkCategoryName) {
			return function (event) {
				event.stopPropagation();
				scope.$emit('landmarkCategoryChange', landmarkCategoryName)	
			}
		}
	}
}
}])