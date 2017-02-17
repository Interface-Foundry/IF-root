
module.exports = function(grunt) {
	// Project assets files (JS & CSS)
	var 
	JSsourceFiles = [
		'assets/js/*.js',
    '!assets/js/*.min.js'
	],
	CCSsourceFiles = [
		'assets/css/*.css',
    '!assets/css/*.min.css'
	];
	
  grunt.initConfig({
    // Lint Project Assets JS & CSS 
    jshint: {
      all: [JSsourceFiles], 
			options: {
        reporter: 'jslint',
        reporterOutput: './build/logs/jshint.xml',
				ignores: ['assets/js/**/*min.js']
      }
    },
		csslint: {
			options: {
				formatters: [
				  {id: 'lint-xml', dest: './build/logs/csslint.xml'}
				],
			 ignores: ['assets/css/**/*min.css']
      },
			strict: {
				options: {
				  import: 2
        },
        src: [CCSsourceFiles]
      }
    },
    // Minimify Project Assets JS & CSS
		uglify: {
			build: {
				files: [{
					expand: true,
					src: './assets/js/*.js',
					ext: '.min.js'
				}]
			}
		},
		cssmin: {
			target: {
				files: [{
				expand: true,
				src: './assets/css/*.css',
				ext: '.min.css'
				}]
			}
		},
        
    // Download all external assets using bower
    bower: {
      install: {
        options: {
          copy: false,
          layout: 'byType',
          install: true,
          verbose: false,
          prune: false,
          cleanTargetDir: false,
          cleanBowerDir: false
        }
      }
    },
    // copy the external assets  
    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true,  flatten: true, src: ['./assets/vendor/bootstrap/dist/js/*'], dest: './assets/lib/bootstrap/', filter: 'isFile'},
          {expand: true,  flatten: true, src: ['./assets/vendor/bootstrap/dist/css/*'], dest: './assets/lib/bootstrap/', filter: 'isFile'},
          
          {expand: true,  flatten: true, src: ['./assets/vendor/jquery/dist/jquery.min.js'], dest: './assets/lib/jquery/', filter: 'isFile'},
          {expand: true,  flatten: true, src: ['./assets/vendor/jquery/dist/jquery.min.map'], dest: './assets/lib/jquery/', filter: 'isFile'},
          
          {expand: true,  flatten: true, src: ['./assets/vendor/tether/dist/js/*min.js'], dest: './assets/lib/tether/', filter: 'isFile'},
          {expand: true,  flatten: true, src: ['./assets/vendor/tether/dist/css/*min.css'], dest: './assets/lib/tether/', filter: 'isFile'},
          
          {expand: true,  flatten: true, src: ['./assets/vendor/fontawesome/fonts/*'], dest: './assets/lib/fonts/', filter: 'isFile'},
          {expand: true,  flatten: true, src: ['./assets/vendor/fontawesome/css/font-awesome.min.css'], dest: './assets/lib/fontawesome/', filter: 'isFile'},
          
          {expand: true,  flatten: true, src: ['./assets/vendor/fancybox/source/*'], dest: './assets/lib/fancybox/', filter: 'isFile'},
        ],
      },
    },

    clean:  {
      // CleanUp bower download
      vendor: [
        './assets/vendor'
      ],
      // CleanUp lib
      lib: [
        './assets/lib'
      ],
    }
      
  });
	
  // set the grunt force option
  grunt.option("force", true);
	// Load the tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-copy');
	// Register the tasks
  grunt.registerTask('minify', ['uglify', 'cssmin']);
  grunt.registerTask('bower-install', ['clean:lib', 'bower', 'copy', 'clean:vendor']);
  grunt.registerTask('check', ['jshint', 'csslint']);
};
