var shelljs = require('shelljs');
var fs = require('fs');
var path = require('path');
var extend = require('node.extend');


// 默认的对比目录
var defaultFolder = {
    // 对比的基准目录
    base: "./test/base/",
    // 对比的目标目录
    target: "./test/target/"
};

var gDiffConfig = require('./config');
gDiffConfig = gDiffConfig ? extend(true, defaultFolder, gDiffConfig) : defaultFolder;
console.log('diff config:', gDiffConfig);

var outputFileName = "list.txt";

var runDiff = function(){
    /*
    var curFolder = process.cwd();
    var baseFolder = path.resolve(curFolder, gDiffConfig.base).split(path.sep).join('/');
    var targetFolder = path.resolve(curFolder, gDiffConfig.target).split(path.sep).join('/');
    */

    // 目前只支持相对目录下的对比
    var baseFolder = gDiffConfig.base;
    var targetFolder = gDiffConfig.target;
    console.log('baseFolder:', baseFolder);
    console.log('targetFolder:', targetFolder);

    // 直接用 > 输出到文件好像不成功，以后再找找原因
    var cmd = "git diff --no-index --name-only " + baseFolder + " " + targetFolder;
    console.log('cmd:', cmd);
    shelljs.exec(cmd, function(code, output) {
        // console.log('git diff exit code:', code);
        // console.log('git diff output:', output);
        // 输出文件列表到指定文件
        fs.writeFileSync(outputFileName, output, "utf-8");
    });

};


runDiff();
