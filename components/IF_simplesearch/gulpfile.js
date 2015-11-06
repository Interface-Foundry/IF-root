var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var usemin = require('gulp-usemin');

gulp.task('default', ['sass', 'minify']);

gulp.task('clean', function(){
    return gulp.src('dist/')
        .pipe(clean());
});

gulp.task('templates', ['clean'], function(){
    return gulp.src(['./static/**/*.html'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('favicon', ['clean'], function(){
    return gulp.src(['./static/favicon/*'])
        .pipe(gulp.dest('dist/favicon/'));
});
gulp.task('fonts', ['clean'], function(){
    return gulp.src(['./static/fonts/*'])
        .pipe(gulp.dest('dist/fonts/'));
});
gulp.task('img', ['clean'], function(){
    return gulp.src(['./static/img/*'])
        .pipe(gulp.dest('dist/img/'));
});

gulp.task('css', function() {
    //minify css
    /*gulp.src('./static/css/vendor/*.css')
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('dist/css/'));*/
    gulp.src('./static/css/.css')
        .pipe(postcss([autoprefixer({ browsers: ['last 2 versions']})]))
        .pipe(minifyCss());
});

gulp.task('dist', ['clean','templates', 'favicon', 'fonts', 'img', 'usemin']);



gulp.task('usemin',['clean'],function() {
  return gulp.src('./simpleSearch.html')
    .pipe(usemin({
      venderCss: ['concat'],
      css: [minifyCss()],
      html: [ minifyHtml({ empty: true }) ],
      js: [ uglify(), 'concat' ],
      vendor: [ uglify(), 'concat' ]
    }))
    .pipe(gulp.dest('dist/'));
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