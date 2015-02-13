app.directive('ifHref', function() { //used to make URLs safe for both phonegap and web.
	return {
		restrict: 'A',
		priority: 99, 
		link: function($scope, $element, $attr) {
			$attr.$observe('ifHref', function(value) {
				if (!value) {
					$attr.$set('href', null);
				return;
				}
			
			//@IFDEF WEB
			var firstHash = value.indexOf('#');
			if (firstHash > -1) {
				value = value.slice(0, firstHash) + value.slice(firstHash+1);
			}
			//@ENDIF
			$attr.$set('href', value);
			
			});
				
		}
	}
});