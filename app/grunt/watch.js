module.exports = {
	files: ['src/**/*'],
	tasks: ['newer:less', 'newer:concat', 'newer:uglify', 'newer:copy', 'newer:preprocess'],
	options: {
		
	}
};