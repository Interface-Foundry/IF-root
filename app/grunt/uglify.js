module.exports = {
	options: {
		compress: {
			drop_console: true
		}
	},
	js: {
		files: {
			'dist/app.min.js': ['dist/app.js']
		}
	}
};