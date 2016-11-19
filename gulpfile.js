var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = new gulpLoadPlugins();

var Server = plugins.karma.Server;
var path = {
    html: 'demo.html',
    test: ['test/*.spec.js'],
    source: 'src/*.js',
    styles: 'src/*.scss',
    build: 'ng-duration-picker.js',
    min: 'ng-duration-picker.min.js',
    dest: 'dist'
};

// test tasks
gulp.task('test', function(done) {
  return new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

// server tasks
gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('serve', ['lint','watch'], function() {
  return gulp.src('.')
    .pipe(plugins.webserver({
      fallback: path.html,
      livereload: true
    })); 
});

gulp.task('watch', function () {
  plugins.watch(path.styles, { ignoreInitial: false })
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path.dest));
})

// development tasks
gulp.task('styles', function () {
  return gulp.src(path.styles)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path.dest))
});
gulp.task('default', ['serve']);

// production tasks
gulp.task('dist', function() {
  return gulp.src(path.source)
  .pipe(plugins.plumber())
  .pipe(plugins.babel({
      presets: ['es2015']
  }))
  .pipe(plugins.concat(path.build))
  .pipe(gulp.dest(path.dest));
});

gulp.task('build', ['lint', 'dist', 'styles'], function() {
  return gulp.src(path.source)
    .pipe(plugins.plumber())
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({
        presets: ['es2015']
    }))
    .pipe(plugins.concat(path.min))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path.dest));
});


