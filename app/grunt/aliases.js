module.exports = function(grunt) {
	return {
		"default": [
			'preprocess',
			'less',
			'concat',
			'uglify',
			'copy'
		]
	}
}