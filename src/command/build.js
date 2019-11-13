var program = require('commander');
const basePath = process.cwd();
let handleUserInput = require('../utils/handleInput');
const handleConfigJSON = require('../utils/handleConfigJSON');
const configJSON = handleConfigJSON(basePath);
const log = require('fancy-log');
const colors = require('ansi-colors');

log(
  colors.green(
    '=============================================================================='
  )
);
log(colors.green('* 配置参数：'), configJSON);
log(
  colors.green(
    '=============================================================================='
  )
);

const commandName = 'build';

program
  .command(commandName)
  .description('构建项目')
  .action(function(options) {
    const { version, environment, flatform } = configJSON;
    handleUserInput(commandName, {
      ENVIRONMENT: environment || 'pro',
      VERSION: version || '1.0.0',
      PLATFORM: flatform || '',
    });
  });
program.parse(process.argv); // 开始解析用户输入的命令
