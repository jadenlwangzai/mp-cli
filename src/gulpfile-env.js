const gulp = require('gulp');
const replace = require('gulp-string-replace');
const path = require('path');
const log = require('fancy-log');
const colors = require('ansi-colors');
const buildTaskCommon = (_config, cb) => {
  let pathStr = path.resolve(process.cwd(), 'ENV.js');
  gulp
    .src([pathStr])
    .pipe(replace(/\_\_NET\_ENV\_\_/, `'${_config.ENVIRONMENT}'`))
    .pipe(replace(/\_\_VERSION\_\_/, `'${_config.VERSION}'`))
    .pipe(gulp.dest('./ENV'));
  cb();
};

gulp.task('default', cb => {
  let { ENVIRONMENT, VERSION } = process.env;
  console.log(ENVIRONMENT, VERSION);
  buildTaskCommon(
    {
      VERSION,
      ENVIRONMENT,
    },
    cb
  );
});
