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
const configJSON = handleConfigJSON(basePath); // {"version": "1.1.0","platform":"wx"}
var clean = require('gulp-clean');

let isPkgModify = true;
const { VERSION, ENVIRONMENT } = process.env;
const { platform } = configJSON;

if (!platform) {
  log(colors.red('========================================================='));
  log(colors.red('* 请在mp-cli.config.js中输入platform值'));
  log(colors.red('========================================================='));
  return;
}

const buildPlatformName = `${basePath}/dist/${platform}-${VERSION}`;

function copy_src() {
  return gulp
    .src([`${basePath}/.npmrc`, `${basePath}/src/**`])
    .pipe(gulp.dest(buildPlatformName));
}

function copy_CDN() {
  return gulp
    .src([`${basePath}/CDN/**`])
    .pipe(gulp.dest(`${basePath}/dist/CDN`));
}

function select_pkg() {
  let pkg = null;
  let oldPkg = null;

  try {
    pkg = require(`${basePath}/package.json`);
  } catch (error) {
    log(
      colors.red('=========================================================')
    );
    colors.res('该项目目录下没有package.json');
    log(
      colors.red('=========================================================')
    );
  }
  if (!pkg) {
    return null;
  }

  try {
    oldPkg = require(`${buildPlatformName}/package.json`);
  } catch (error) {
    log(
      colors.red('=========================================================')
    );
    log(colors.red(error));
    log(colors.red('该项目还未构建出dist包'));
    log(
      colors.red('=========================================================')
    );
  }
  if (oldPkg) {
    isPkgModify =
      JSON.stringify(oldPkg.dependencies) !== JSON.stringify(pkg.dependencies);
  }
  if (pkg.devDependencies) {
    // 只取项目依赖，工程依赖删除
    delete pkg.devDependencies;
  }
  return writePkg(buildPlatformName, pkg);
}

function css() {
  const CDN_ENV_FLAG = ENVIRONMENT === 'pro' ? 'static' : 'static-test';
  log(colors.green('=========================='));
  log(colors.green('* CDN链接：'), colors.green(CDN_ENV_FLAG));
  log(colors.green('=========================='));
  return (
    gulp
      .src(`${buildPlatformName}/**/*.{css,less}`)
      .pipe(less({ globalVars: { CDN_ENV_FLAG } }))
      // .pipe(postcss([pxtorpx()]))
      .pipe(
        rename(path => {
          // 环境
          if (platform === 'ali') {
            path.extname = '.acss';
          } else {
            path.extname = '.wxss';
          }
        })
      )
      .pipe(gulp.dest(buildPlatformName))
  );
}

// 结合当前环境 删除dist多余文件
function cleanFile() {
  let extName = {
    ali: 'wxss,less,css',
    wx: 'acss,less,css',
  };
  return gulp
    .src(`${buildPlatformName}/**/*.{${extName[platform]}}`)
    .pipe(clean())
    .pipe(gulp.dest(buildPlatformName));
}

// 结合当前环境 删除dist多余文件
function replace_flag() {
  let { ENVIRONMENT, VERSION } = process.env;
  return gulp
    .src(`${buildPlatformName}/**/*.js`)
    .pipe(replace(/\_\_NET\_ENV\_\_/, `'${ENVIRONMENT}'`))
    .pipe(replace(/\_\_VERSION\_\_/, `'${VERSION}'`))
    .pipe(gulp.dest(buildPlatformName));
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
const base = gulp.series(
  select_pkg,
  copy_CDN,
  copy_src,
  replace_flag,
  css,
  cleanFile,
  function(done) {
    let { ENVIRONMENT, VERSION } = process.env;
    log(colors.green('=========================='));
    log(colors.green('环境参数：'), colors.green(ENVIRONMENT));
    log(colors.green('版本参数：'), colors.green(VERSION));
    log(colors.green('=========================='));
    done();
  }
);

gulp.watch(
  `${basePath}/src/**`,
  {
    // delay:1000
  },
  gulp.series(base)
);

gulp.watch(
  `${basePath}/CDN/**`,
  {
    // delay:1000
  },
  gulp.series(base)
);

const run = gulp.series(base, () => {
  if (isPkgModify) {
    if (shell.cd(buildPlatformName).code !== 0) {
      log(colors.red('cd dist error'));
    }
    shell.exec(`npm install`);
  }
});

module.exports = {
  run,
};
