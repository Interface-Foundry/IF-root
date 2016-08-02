module.exports = {
	files: ['src/**/*'],
	tasks: ['less', 'newer:concat', 'newer:uglify', 'newer:copy', 'newer:preprocess'],
	options: {
		
	}
};