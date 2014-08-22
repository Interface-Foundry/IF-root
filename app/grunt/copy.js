module.exports = {
		main: {
			files: [
			{expand: true, cwd: 'src/', src: ['img/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['partials/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['fonts/**'], dest: 'dist/'},
			{expand: true, cwd: 'src/', src: ['components/**', '!**/*.js'], dest: 'dist/'}
			]
		}
}