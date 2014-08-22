module.exports = function(grunt) {
	return {
		"default": [
			'preprocess',
			'concat',
			'uglify',
			'copy'
		]
	}
}