var program = require( "commander" );
program.parse( process.argv ); //开始解析用户输入的命令
console.log( program.args )
console.log( __dirname )
require( __dirname + "/command/" + program.args[0] + ".js" ); // 根据不同的命令转到不同的命令处理文件
