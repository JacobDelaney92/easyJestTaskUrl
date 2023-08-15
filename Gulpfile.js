const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create(); // Add this line

gulp.task('sass', function() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream()); // Inject CSS changes without full page reload
});

gulp.task('babel', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.stream()); // Inject JS changes without full page reload
});

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/js/**/*.js', gulp.series('babel'));
});

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: './', // Change this to your base directory
    },
  });

  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/js/**/*.js', gulp.series('babel'));
  gulp.watch(['*.html', 'dist/css/**/*.css', 'dist/js/**/*.js']).on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('sass', 'babel', 'serve'));
