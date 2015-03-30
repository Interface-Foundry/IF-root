'use strict';

app.directive('lazyLoad', lazyLoad);

lazyLoad.$inject = [];

function lazyLoad() {
	return {
		scope: {
			loadMore: '&'
		},
		restrict: 'A',
		link: link
	};

	function link(scope, elem, attr) {
		var visibleHeight = elem.height();
		var threshold = 500;

		elem.scroll(function() {
			var scrollableHeight = elem.prop('scrollHeight');
			var hiddenContentHeight = scrollableHeight - visibleHeight;

			if (hiddenContentHeight - elem.scrollTop() < threshold) {
				// scroll is almost at bottom. Load more data
				scope.$apply(scope.loadMore);
			}
		});
	}
}
