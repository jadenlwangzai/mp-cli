var program = require('commander');

const commandName = 'init';

program
  .command(commandName)
  .description('init project for local')
  .action(function(options) {
    console.log('init command');
  });
program.parse(process.argv); //开始解析用户输入的命令
