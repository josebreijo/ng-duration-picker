var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var chai = require('chai');
var request = require('supertest');

var path = {
    html: 'client/index.html',
    server: ['server/*.js', 'server/**/*.js'],
    test: ['test/*.spec.js'],
    client: 'client/src/app.js',
    min_client: 'client.min.js',
    out_client: 'client.js',
    dest: 'build'
};

// test tasks
gulp.task('test', function() {
    gulp.src(path.test)
        .pipe(mocha({
      reporter: 'spec',
      globals: {
    expect: chai.expect,
    assert: chai.assert,
    request: request
      }
  }));
    chai.should();
});

// server tasks
gulp.task('lint', function() {
    gulp.src(path.server)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});
gulp.task('serve', function() {
    nodemon({
  script: 'server/app.js',
  ext: 'js',
  ignore: ['client/*'],
  tasks: ['watch', 'lint'],
  env: { 'NODE_ENV': 'development' }
    });
});

// development tasks
gulp.task('copy', function() {
    gulp.src(path.html)
        .pipe(gulp.dest(path.dest));
});
gulp.task('watch', function() {
    gulp.watch(gulp.src(path.html, ['copy']));
    var watcher = watchify(browserify({
  entries: [path.client],
  transform: [reactify],
  debug: true,
  cache: { },
  packageCache: { },
  fullPaths: true
    }));
    return watcher.on('update', function() {
  watcher.bundle()
      .pipe(source(path.out_client))
      .pipe(gulp.dest(path.dest));
  console.log('Updated');
    })
  .bundle()
  .pipe(source(path.dest))
  .pipe(gulp.dest(path.out_client));
});
gulp.task('default', ['serve']);

// production tasks
gulp.task('build', function() {
    browserify({
  entries: [path.client],
  transform: [reactify]
    })
  .bundle()
  .pipe(source(path.min_client))
  .pipe(streamify(uglify(path.min_client)))
  .pipe(gulp.dest(path.dest));
});
gulp.task('replace', function() {
    gulp.src(path.html)
        .pipe(htmlreplace({
      'js': 'build/' + path.min_client
  }))
        .pipe(gulp.dest(path.dest));
});
gulp.task('production', ['replace', 'build']);


