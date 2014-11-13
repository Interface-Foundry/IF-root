module.exports = {
		main: {
			files: [
			{expand: true, cwd: 'src/', src: ['img/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['partials/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['fonts/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['components/**', '!**/*.js'], dest: 'dist/'},
			{expand: true, flatten: true, cwd: 'src/', src: ['js/directives/templates/*'], dest: 'dist/templates'}
			]
		},
		phonegap: {
			files: [
			{expand: true, cwd: 'src/', src: ['img/**'], dest: 'phonegap/www/'},
			{expand: true, cwd: 'src/', src: ['partials/**'], dest: 'phonegap/www/'},
			{expand: true, cwd: 'src/', src: ['fonts/**'], dest: 'phonegap/www/'},
			{expand: true, cwd: 'src/', src: ['components/**', '!**/*.js'], dest: 'phonegap/www/'},
			{expand: true, flatten: true, cwd: 'src/', src: ['js/directives/templates/*'], dest: 'phonegap/www/templates'}
			]
		}
}