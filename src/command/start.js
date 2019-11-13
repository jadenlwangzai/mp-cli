let program = require('commander');
let inquirer = require('inquirer');
let handleUserInput = require('../utils/handleInput');
const choices = ['dev', 'test', 'uat', 'pro'];
const basePath = process.cwd();
const handleConfigJSON = require('../utils/handleConfigJSON');
const configJSON = handleConfigJSON(basePath);
const log = require('fancy-log');
const colors = require('ansi-colors');

const commandName = 'start';

program
  .command(commandName)
  .description('请选择构建环境,以及版本')
  .action(function(options) {
    let ENV = null;
    let questions = [
      {
        type: 'input',
        name: 'VERSION',
        message: '请输入构建版本！',
        default: configJSON.version ? configJSON.version : '1.0.0',
      },
    ];
    if (typeof options === 'string') {
      ENV = options;
    } else {
      questions.unshift({
        type: 'list',
        name: 'ENVIRONMENT',
        message: '请选择构建环境！',
        choices,
      });
    }
    // 调用问题
    inquirer
      .prompt(questions)
      .then(answers => {
        if (ENV) {
          answers['ENVIRONMENT'] = ENV;
        }
        log(colors.green('=========================='));
        log(colors.green('* 输入信息'), answers);
        log(colors.green('=========================='));
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
            handleUserInput(commandName, answers); //
          }
        });
      });
  });

program.parse(process.argv); //开始解析用户输入的命令
