import browserSync from 'browser-sync';
import data from 'gulp-data';
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import inlineCss from 'gulp-inline-css';
import newer from 'gulp-newer';
import nunjucksRender from 'gulp-nunjucks-render';
import postcss from 'gulp-postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssSimpleVars from 'postcss-simple-vars';
import rucksack from 'rucksack-css';

import dataJson from './src/data.json';

const paths = {
  dist: 'dist',
  styles: 'src/styles',
  templates: 'src/templates',
};

nunjucksRender
  .nunjucks
  .configure(['src/templates/'], {
    watch: true,
  });

gulp.task('build:images', () => {
  return gulp.src(`${paths.templates}/**/*.{gif,jpg,png}`)
    .pipe(newer(paths.dist))
    .pipe(imagemin({
      optimizationLevel: 5,
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build:html', () => {
  return gulp.src([
    `${paths.templates}/**/*.nj`,
    '!src/templates/*.nj',
  ])
    .pipe(data(dataJson))
    .pipe(nunjucksRender())
    .pipe(gulp.dest(paths.dist))
    .pipe(inlineCss())
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build:styles', () => {
  return gulp.src([
    `${paths.styles}/**/*.css`,
    `${paths.templates}/**/*.css`,
    '!src/styles/variables.css',
  ])
    .pipe(postcss([
      postcssImport(),
      postcssNested(),
      postcssSimpleVars(),
      rucksack({
        autoprefixer: true,
      }),
    ]))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', gulp.series(
  'build:images',
  'build:styles',
  'build:html'
));

gulp.task('watch', () => {
  gulp.watch([
    `${paths.styles}/**/*.css`,
    `${paths.templates}/**/*.css`,
  ], gulp.series('build'));
  gulp.watch(`${paths.templates}/**/*.nj`, gulp.series('build'));
  gulp.watch(`${paths.images}/**/*.{gif,jpg,png}`, gulp.series('build'));
});

gulp.task('serve', gulp.series(
  'build',
  function ws(cb) {
    browserSync({
      server: {
        baseDir: `./${paths.dist}`,
        directory: true,
      },
    }, cb);
  },
  'watch'
));

gulp.task('default', gulp.series('build'));
