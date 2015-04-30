app.directive('ifSrc', function() { //used to make srcs safe for phonegap and web. Only for hosted content
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
				if (value.indexOf('http')<0) {
					value = 'https://kipapp.co/'+value;
					//value = 'http://web-server-squirtle.kipapp.co:2997/' + value;

				}
				//@ENDIF	
				
				$attr.$set('src', value);
			
			});
				
		}
	}
});