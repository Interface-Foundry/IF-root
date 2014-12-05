module.exports = function(grunt) {
	return {
		"default": [
			'less',
			'concat',
			'copy',
			'preprocess',
			'uglify',
			'angular_architecture_graph'
		]
	}
}