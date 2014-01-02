var shelljs = require('shelljs');
var fs = require('fs');
var path = require('path');
var extend = require('node.extend');


// 默认的打包目录
var defaultFolderInfo = {
    pkgName: "vod.lixian",
    pkgFolder: "../../export/debug/"
};

var gFolderInfo = extend(true, defaultFolderInfo, {});


// flash文件列表
var flashFiles = [
    "media/tryPanel.swf",
    "media/vodPlayer_2.8.swf",
    "media/vodPlayer_trial.swf"
];


// 打包函数
var package = function(action){
    // 先将目标目录拷贝到当前目录
    var fromDir = gFolderInfo.pkgFolder;
    var toDir = gFolderInfo.pkgName;
    shelljs.mkdir(toDir);
    shelljs.cp("-rf", fromDir, toDir);


    var tarFiles = "";
    // 只打包flash文件
    if(action == "flash"){
        console.log('Package Flash Files ...');

        var arr = [];
        flashFiles.forEach(function(element){
            arr.push( toDir + "/" + element);
        });

        tarFiles = arr.join(" ");
        // console.log('tarFiles:', tarFiles);
    }
    // 打包指定列表
    else if(action == "list"){
        console.log('Package list.txt Files ...');

        var fileContent = fs.readFileSync("list.txt", "utf-8");
        // 替换win的换行
        fileContent = fileContent.replace("\r\n", "\n");
        // 替换mac的换行，以及win的\r(回到行首)
        fileContent = fileContent.replace("\r", "\n");
        var filesArr = fileContent.split("\n");

        var arr = [];
        filesArr.forEach(function(element){
            // 跳过空字符串
            if(element)
                arr.push( toDir + "/" + element);
        });
        // console.log('tarFiles:', arr);

        tarFiles = arr.join(" ");
    }
    // 打包整个目录
    else{
        console.log('Package Whole Folder ...');
        tarFiles = toDir;
    }


    // 运行打包程序
    if(tarFiles){
        var cmd = "tar -zcvf " + toDir + ".tar.gz " + tarFiles;
        // console.log('cmd:', cmd);
        shelljs.exec(cmd);
    }


    // 删除临时目录
    shelljs.rm("-rf", toDir);
};


// 命令处理及运行
var runTool = function(){
    var action = process.argv[2] || "";
    // 支持命令'-'的形式
    if(action)
        action = action.replace("-", "");

    package(action);
};


runTool();
