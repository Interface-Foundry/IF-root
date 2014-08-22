module.exports = {
	lib: {
		src: [
			'src/lib/angular/angular-strap.js',
			'src/lib/**/*.js'
			],
		dest: 'dist/lib.js'
	},
	js: {
		src: [
			'src/js/**/*.js', 
			'src/components/**/*.js'],
		dest: 'dist/app.js'
	},
	css: {
		src: ['src/**/*.css'],
		dest: 'dist/app.css'
	}
}