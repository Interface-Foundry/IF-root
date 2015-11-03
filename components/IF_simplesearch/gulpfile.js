var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var csswring = require('csswring');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

gulp.task('default', ['sass', 'minify']);

gulp.task('sass', function() {
    //minify css
    gulp.src('./static/css/simpleSearch.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([autoprefixer({
                browsers: ['last 2 versions']
            }),
            csswring
        ]))
        .pipe(concat('simpleSearch.mincat.css')) //rename file via concat
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./static')); // pushing mincat.css to static
    // gulp.src(['./static/css/simpleSearch.min.css'])
    //     .pipe(concat('simpleSearch.mincat.css'))
    //     .pipe(gulp.dest('./static'));
    //minify and concat js

});

gulp.task('minify', function() {

    gulp.src(['./static/lib/tominify/*.js'])
        .pipe(concat('minified.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./static/lib/min'));
    gulp.src([ '!.static/lib/min/moment-angular.min.js', './static/lib/min/moment.min.js', './static/mincat.js', './static/lib/min/*.js', '!./static/dev/*.js', '!.static/dev/tominify/*'])
        .pipe(sourcemaps.init())
        .pipe(concat('simpleSearch.mincat.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static'));
    gulp.src('./static/simpleSearch.js')
        .pipe(concat('mincat.js'))
        //.pipe(uglify()) //minifies
        .pipe(gulp.dest('./static')) //save to static
});

gulp.task('minify-casey', function() {
    /*gulp.src(['./static/lib/min/angular.min.js'])
        .pipe(concat('minified.js'))*/
    gulp.src(['./static/lib/min/angular.min.js', './static/lib/min/angular-route.min.js', './static/lib/min/ui-bootstrap-tpls-0.13.4.min.js', './static/lib/min/moment.min.js', './static/dev/tominify/*.js'])
        .pipe(concat('minified.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./static/lib/min'));
    gulp.src([ './static/lib/min/minified.js','./static/lib/min/*.js','!.static/lib/min/moment-angular.min.js', './static/mincat.js', '!./static/dev/*.js', '!.static/dev/tominify/*'])
        .pipe(sourcemaps.init())
        .pipe(concat('simpleSearch.mincat.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static'));
    gulp.src('./static/simpleSearch.js')
        .pipe(concat('mincat.js'))
        //.pipe(sourcemaps.init())
        //.pipe(uglify()) //minifies
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('./static')); //save to static
});

gulp.task('watch', function () {
    gulp.watch('./static/css/simpleSearch.css', ['sass']);
    gulp.watch('./static/simpleSearch.js', ['minify']);
});
/*
gulp.task('watch', function() {
    // watch scss files
    gulp.watch('./static/css/simpleSearch.css', function() {
        gulp.run('sass');
    });
    gulp.watch('./simpleSearch.js', function() {
        gulp.run('default');
    });

});*/