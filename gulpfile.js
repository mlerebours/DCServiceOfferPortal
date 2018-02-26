var gulp = require('gulp'); // Require gulp

// Sass dependencies
var minifyCSS = require('gulp-minify-css'); // Minify the CSS

// Minification dependencies
var minifyHTML = require('gulp-minify-html'); // Minify HTML
var processhtml = require('gulp-processhtml');
var concat = require('gulp-concat'); // Join all JS files together to save space
var stripDebug = require('gulp-strip-debug'); // Remove debugging stuffs
var uglify = require('gulp-uglify'); // Minify JavaScript
var imagemin = require('gulp-imagemin'); // Minify images

// Other dependencies
var size = require('gulp-size'); // Get the size of the project
var browserSync = require('browser-sync'); // Reload the browser on file changes
var jsonminify = require('gulp-jsonminify');

// Tasks -------------------------------------------------------------------- >

// Task to compile Sass file into CSS, and minify CSS into build directory
gulp.task('styles', function() {
    gulp.src('./src/css/*.css')
        .pipe(gulp.dest('./dist/css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.reload({
            stream: true,
        }));
});

// Task to minify new or changed HTML pages
gulp.task('html', function() {
    gulp.src('./src/*.html')
        //.pipe(minifyHTML())
        .pipe(processhtml())
        .pipe(gulp.dest('./dist/'));
});

// Task to concat, strip debugging and minify JS files
gulp.task('scripts', function() {
    gulp.src(['./src/js/lib.js', './src/js/*.js'])
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'));
});

// Task to minify images into build
gulp.task('images', function() {
    gulp.src('./src/img/**/*.*')
        .pipe(imagemin({
            progressive: true,
        }))
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('json', function () {
    return gulp.src(['./src/data/poster.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest('dist/data'));
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src('./src/fonts/*')
        .pipe(gulp.dest('dist/fonts/'));
});

// Task to get the size of the app project
gulp.task('size', function() {
    gulp.src('./src/**')
        .pipe(size({
            showFiles: true,
        }));
});

// Task to get the size of the build project
gulp.task('build-size', function() {
    gulp.src('./dist/**')
        .pipe(size({
            showFiles: true,
        }));
});

// Serve application
gulp.task('serve', ['styles', 'scripts', 'images', 'json', 'fonts', 'html', 'size'], function() {
    browserSync.init({
        server: {
            baseDir: 'src',
        },
    });
});

// Serve application
gulp.task('build', ['styles', 'scripts', 'images', 'json', 'fonts', 'html', 'size']);

// Run all Gulp tasks and serve application
gulp.task('default', ['serve', 'styles'], function() {
    gulp.watch('src/css/**/*.css', ['styles']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});