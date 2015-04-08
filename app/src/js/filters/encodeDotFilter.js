app.filter('encodeDotFilter', [function() {
	/**
	 * replace "." with "dot" (or vice-versa) for use in URLs. 
	 * e.g /blah/lat90.5/blah becomes /blah/lat90dot5/blah
	 * direction (required): encode from "." to "dot", decode from "dot" to "."
	 * toFloat (optional): must convert to String on encode; toFloat = true will convert to Float on decode
	 */

	 return function(input, direction, toFloat) {
	 	if (direction === 'encode') {
	 		input = String(input);
	 		return input.replace('.', 'dot');
	 	} else if (direction == 'decode') {
	 		input = input.replace('dot', '.');
	 		if (toFloat) {
	 			return parseFloat(input);
	 		}
	 		return input;
	 	}
	 }

}]);