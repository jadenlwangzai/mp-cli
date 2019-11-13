const spawn = require('cross-spawn');
const shell = require('shelljs');
const path = require('path');
const log = require('fancy-log');
const colors = require('ansi-colors');

let handleConfigToCrossEnv = require('../utils/handleConfigToCrossEnv');
module.exports = function handleUserInput(commandName, config) {
  let pathStr = path.resolve(__dirname, '../', `gulpfile-${commandName}.js`);
  let formatConfig = handleConfigToCrossEnv(config);
  shell.exec(`${formatConfig}  gulp run --gulpfile '${pathStr}' --cwd .`);
};
