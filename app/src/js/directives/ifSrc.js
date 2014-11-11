app.directive('ifSrc', function() {
	return {
		restrict: 'A',
		priority: 99, 
		link: function($scope, $element, $attr) {
			$attr.$observe('ifSrc', function(value) {
				if (!value) {
					$attr.$set('src', null);
				return;
				}
			
				//@IFDEF PHONEGAP
				value = 'https://bubbl.li/'+value;
				//@ENDIF	
				
				$attr.$set('src', value);
			
			});
				
		}
	}
});