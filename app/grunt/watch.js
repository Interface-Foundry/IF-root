module.exports = {
	files: ['src/**/*'],
	tasks: ['newer:preprocess', 'newer:concat', 'newer:uglify', 'newer:copy'],
	options: {
		
	}
};