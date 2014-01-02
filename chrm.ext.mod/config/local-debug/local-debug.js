var shelljs = require('shelljs');
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');

var localConfig = require('./config');
console.log('local debug config hi:', localConfig);
var folder = localConfig.folder;
var domain = localConfig.domain;


var runNginx = function(option, configFile){
    var cmd = "";
    var filePath = configFile || "";
    // 启动nginx
    if(option == "start"){
        cmd = 'nginx';
        if(filePath){
            cmd = 'nginx -c ' + filePath;
            console.log('nginx start in -c mode');
        }
        else{
            console.log('nginx start in pure mode');
        }
        // console.log('cmd:', cmd);

        var oriPwd = shelljs.pwd();
        // 需要进入nginx的目录才能运行
        shelljs.cd( folder.nginx );

        // 运行
        shelljs.exec(cmd, function(code, output) {
            console.log('nginx exit code:', code);
            console.log('nginx program output:', output);
        });

        // shelljs.cd('-');    // 不支持'-'退回上一级
        shelljs.cd( oriPwd );
    }
    else if(option == "quit"){
        // windows下需要杀进程才能完全结束任务
        cmd = "taskkill /F /IM nginx.exe > nul";

        shelljs.exec(cmd);

        console.log('nginx exit success');
    }
};



var genConfigFile = function(){
    var tplConfigAddr = "nginx/tpl-nginx.conf";
    var desConfigAddr = "nginx/conf/nginx.conf";

    // 读取模板
    var tpl = fs.readFileSync(tplConfigAddr, "utf-8");

    // 判断来源数据有效性
    if(!folder.project && !folder.js){
        console.log('project folder or js folder is not filled');
        return ""
    }

    // 准备数据
    var curFolder = process.cwd();
    var projFolder = path.resolve(curFolder, folder.project).split(path.sep).join('/');    // 替换成nginx支持的'/'
    var jsFolder = path.resolve(curFolder, folder.js).split(path.sep).join('/');
    var otherFolder = path.resolve(curFolder, folder.other).split(path.sep).join('/');

    var config = {
        domain: {
            project: domain.project,
            js: domain.js,
            other: domain.other
        },
        folder: {
            project: projFolder,
            js: jsFolder,
            other:otherFolder
        }
    };

    // 填充并输出模板
    var configFile = ejs.render(tpl, { config: config });
    // console.log('configFile:', configFile);
    fs.writeFileSync(desConfigAddr, configFile, "utf-8");

    return path.resolve(curFolder, desConfigAddr).split(path.sep).join('/');
};


// 对外接口函数
var runLocalDebug = function(cmd){
    if(cmd == "pure" || cmd == "-pure"){
        runNginx("quit");
        runNginx("start");
    }
    else if(cmd == "quit" || cmd == "-quit"){
        runNginx("quit");
    }
    else{
        var configFilePath = genConfigFile();
        runNginx("quit");
        runNginx("start", configFilePath);
    }
};


var init = function(){
    // 命令行执行环境
    if( require.main === module ){
        if(process.argv[2])
            runLocalDebug(process.argv[2]);
        else
            runLocalDebug();

        // 退出命令行,延时执行，避免有些打印没打出来以及子进程未启动
        setTimeout(function(){
            process.exit();
        }, 100)
    }
    // require执行环境
    else{
        module.exports = { runLocalDebug: runLocalDebug };
    }
};


init();