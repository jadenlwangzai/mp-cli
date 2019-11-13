let path = require('path');
module.exports = function handleConfigJSON(basePath) {
  let res = {};
  try {
    res = require(path.resolve(basePath, 'mp-cli.config.json'));
  } catch (error) {
    console.log(error);
  }
  return res;
};
