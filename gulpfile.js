/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyes');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');

gulp.task(
  'default',
  ['copy-html', 'optimize', 'styles', 'scripts', 'lint'],
  () => {
    gulp.watch('src/sass/**/*.scss', ['styles']);
    gulp.watch('src/js/**/*.js', ['lint', 'scripts']);
    gulp.watch('src/index.html', ['copy-html']);
    gulp.watch('src/restaurant.html', ['copy-html']);
    gulp.watch('./build/index.html').on('change', browserSync.reload);
    gulp.watch('./build/restaurant.html').on('change', browserSync.reload);
    gulp.watch('./build/css/**/*.css').on('change', browserSync.reload);
    gulp.watch('./build/js/**/*.js').on('change', browserSync.reload);
    browserSync.init({
      server: './dist'
    });
    browserSync.stream();
  }
);

gulp.task('dist', ['copy-html', 'lint', 'optimize', 'scripts-dist', 'styles']);

gulp.task('lint', () => {
  return gulp
    .src(['src/js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('optimize', () => {
  return gulp
    .src('src/img/*')
    .pipe(
      imagemin([
        pngquant(),
        mozjpeg({
          quality: 75
        })
      ])
    )
    .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-html', () => {
  gulp.src('.src/index.html').pipe(gulp.dest('./dist'));
  gulp.src('.src/restaurant.html').pipe(gulp.dest('./dist'));
});
/* gulp.task('copy-images', () => {
  gulp.src('src/img/*').pipe(gulp.dest('dist/img'));
}); */

gulp.task('styles', () => {
  gulp
    .src('sass/**/*.scss')
    .pipe(
      sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', () => {
  gulp
    .src('src/js/**/*.js')
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', () => {
  gulp
    .src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});
