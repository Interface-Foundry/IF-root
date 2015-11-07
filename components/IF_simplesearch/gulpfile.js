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

gulp.task('default', ['dist']);

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

gulp.task('usemin',['clean'],function() {
  return gulp.src('./simpleSearch.html')
    .pipe(usemin({
      venderCss: [minifyCss(),'concat'],
      css: [minifyCss()],
      html: [ minifyHtml({ empty: true }) ],
      js: [ uglify(), 'concat' ],
      vendor: [ uglify(), 'concat' ]
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist', ['clean','templates', 'favicon', 'fonts', 'img', 'usemin']);
