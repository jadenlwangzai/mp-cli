let program = require('commander');
let inquirer = require('inquirer');
let handleUserInput = require('../utils/handleInput');
const log = require('fancy-log');
const colors = require('ansi-colors');

const commandName = 'env';

program
  .command(commandName)
  .description('请选择构建环境,以及版本')
  .action(function(options) {
    let choices = ['dev', 'test', 'uat', 'pro'];
    let questions = [
      {
        type: 'list',
        name: 'ENVIRONMENT',
        message: '请选择构建环境！',
        choices,
      },
      {
        type: 'input',
        name: 'VERSION',
        message: '请输入构建版本！',
        default: '1.0.0',
      },
    ];
    // 调用问题
    inquirer
      .prompt(questions)
      .then(answers => {
        console.log(answers); // 输出最终的答
        return answers;
      })
      .then(answers => {
        let _questions = [
          {
            type: 'confirm',
            name: 'confirm',
            message: '确认版本与环境？？？？？',
            default: true,
          },
        ];
        inquirer.prompt(_questions).then(confirm => {
          if (confirm.confirm) {
            log(colors.green('=========================='));
            log(colors.green('* 输入确认'), colors.green(confirm));
            log(colors.green('=========================='));
            handleUserInput(commandName, answers);
          }
        });
      });
  });

program.parse(process.argv); //开始解析用户输入的命令
