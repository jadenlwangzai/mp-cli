// 本地开发  阶段 提供监听以及变量注入
const gulp = require('gulp');
const replace = require('gulp-string-replace');
const path = require('path');
const basePath = process.cwd();
const log = require('fancy-log');
const colors = require('ansi-colors');
const writePkg = require('write-pkg');
const shell = require('shelljs');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const pxtorpx = require('wx-px2rpx');
const less = require('gulp-less');
const handleConfigJSON = require('./utils/handleConfigJSON');
const configJSON = handleConfigJSON(basePath); // {"version": "1.1.0","flatform":"wx"}
var clean = require('gulp-clean');

let isPkgModify = true;

if (!configJSON.flatform) {
  configJSON.flatform = 'ali';
}

function copy_src() {
  return gulp
    .src([
      `${basePath}/.npmrc`,
      `${basePath}/mp-cli.config.json`,
      `${basePath}/src/**`,
    ])
    .pipe(gulp.dest(`${basePath}/dist`));
}

function select_pkg() {
  let pkg = null;
  let oldPkg = null;

  try {
    pkg = require(`${basePath}/package.json`);
  } catch (error) {
    colors.res('该项目无包依赖');
  }
  if (!pkg) {
    return null;
  }

  try {
    oldPkg = require(`${basePath}/dist/package.json`);
  } catch (error) {
    log(colors.red(error));
    log(colors.red('该项目还未构建过dist目录'));
  }
  if (oldPkg) {
    isPkgModify =
      JSON.stringify(oldPkg.dependencies) !== JSON.stringify(pkg.dependencies);
  }
  if (pkg.devDependencies) {
    // 只取项目依赖，工程依赖删除
    delete pkg.devDependencies;
  }
  return writePkg(`${basePath}/dist`, pkg);
}

function css() {
  let { ENVIRONMENT } = process.env;
  const CDN_ENV_FLAG = ENVIRONMENT === 'pro' ? 'static' : 'static-test';
  log(colors.green('=========================='));
  log(colors.green('* CDN链接：'), colors.green(CDN_ENV_FLAG));
  log(colors.green('=========================='));
  return (
    gulp
      .src(`${basePath}/src/**/*.{wxss,acss,less}`)
      .pipe(
        less({
          globalVars: {
            CDN_ENV_FLAG,
          },
        })
      )
      // .pipe(postcss([pxtorpx()]))
      .pipe(
        rename(path => {
          // 环境
          if (configJSON.flatform === 'ali') {
            path.extname = '.acss';
          } else {
            path.extname = '.wxss';
          }
        })
      )
      .pipe(gulp.dest(`${basePath}/dist`))
  );
}

// 结合当前环境 删除dist多余文件
function cleanFile() {
  let extName = {
    ali: 'wxss,less,css',
    wx: 'acss,less,css',
  };
  return gulp
    .src(`${basePath}/dist/**/*.{${extName[configJSON.flatform]}}`)
    .pipe(clean())
    .pipe(gulp.dest(`${basePath}/dist`));
}

// 结合当前环境 删除dist多余文件
function replace_flag() {
  let { ENVIRONMENT, VERSION } = process.env;
  return gulp
    .src(`${basePath}/dist/*.js`)
    .pipe(replace(/\_\_NET\_ENV\_\_/, `'${ENVIRONMENT}'`))
    .pipe(replace(/\_\_VERSION\_\_/, `'${VERSION}'`))
    .pipe(gulp.dest(`${basePath}/dist`));
}

// function replace_flag_less() {
//   let { ENVIRONMENT } = process.env;
//   let res = "-test";
//   if (ENVIRONMENT === "pro") {
//     res = "";
//   }
//   return gulp
//     .src(`${basePath}/dist/*.less`)
//     .pipe(replace(/\_\_CDN\_BASE\_\_/, `${res}`))
//     .pipe(gulp.dest(`${basePath}/dist`));
// }

// 先copy 再处理各个源 这个处理方式会造成冗余文件，以及后期任务处理的延迟，ide的自动编译有可能报错
const run = gulp.series(
  copy_src,
  replace_flag,
  select_pkg,
  css,
  cleanFile,
  function(done) {
    let { ENVIRONMENT, VERSION } = process.env;
    log(colors.green('=========================='));
    log(colors.green('* 环境参数：'), colors.green(ENVIRONMENT));
    log(colors.green('* 版本参数：'), colors.green(VERSION));
    log(colors.green('=========================='));
    done();
  }
);

module.exports = {
  run,
};
