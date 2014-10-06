module.exports = {
	files: ['src/**/*'],
	tasks: ['newer:preprocess', 'newer:less', 'newer:concat', 'newer:uglify', 'newer:copy'],
	options: {
		
	}
};