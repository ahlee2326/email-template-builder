import browserSync from 'browser-sync';
import data from 'gulp-data';
import gulp from 'gulp';
import inlineCss from 'gulp-inline-css';
import nunjucksRender from 'gulp-nunjucks-render';
import postcss from 'gulp-postcss';
import postcssImport from 'postcss-import';
import postcssSimpleVars from 'postcss-simple-vars';
import rucksack from 'rucksack-css';

import dataJson from './src/data.json';

const paths = {
  css: 'src/styles/**/*.css',
  dist: 'dist',
  html: 'src/templates/**/*.nj',
};

nunjucksRender
  .nunjucks
  .configure(['src/templates/'], {
    watch: true,
  });

gulp.task('build:html', () => {
  return gulp.src([
    paths.html,
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
    paths.css,
    '!src/styles/variables.css',
  ])
    .pipe(postcss([
      postcssImport(),
      postcssSimpleVars(),
      rucksack({
        autoprefixer: true,
      }),
    ]))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', gulp.series(
  'build:styles',
  'build:html'
));

gulp.task('watch:html', () => {
  gulp.watch(paths.html, gulp.series('build'));
});

gulp.task('watch:styles', () => {
  gulp.watch(paths.css, gulp.series('build'));
});

gulp.task('watch', gulp.parallel(
  'watch:html',
  'watch:styles'
));

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
