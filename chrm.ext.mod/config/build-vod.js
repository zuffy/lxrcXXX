(function(){

    var gConfig = {
        // 编译模式
        mode: "",    // 不填:正常模式 custom:自定义模式 develop:开发模式 test:测试模式
        // 版本号
        ver: {
            AppVer: "2.0.0",     // app的大版本号
            CssVer: "1.0",        // css的大版本号
            PubVer: "01",         // 公共的版本号，是基础库的版本号，js和css的小版本号
            FolderVer: "1.0.0"    // spm编译的版本号,spm的规范是三位,不然会影响合并，如: "1.0.0"
        },
        js:{
            base: "http://vod.xunlei.com/page/extension/js/",    // js文件获取的base地址
            min: true,                         // 是否压缩文件
            debugFile: false                    // 是否生成debug文件
        },
        // 是否开启打印
        debug: false,
        // 本地调试是否开启，确定是否生成alias,保证未编译的id解析正确
        localDebug: false,
        // 定义上报等级(小于等于这个级别的都上报) 0:不上报 1:只上报重要的 2:全部上报
        defStatLevel: 1,
        // 执行环境(现在影响ip跳转的配置) 线上:online 预发布:preOnline 测试:test 开发:develop 自定义:custom
        runEnv: "online"

    };


    // 自定义模式
    var customMode = {
        js:{
            base: "http://vod.xunlei.com/page/extension/js/",
            min: false,
            debugFile: false
        },
        debug: true,
        localDebug: false,
        runEnv: "custom"
    };

    // 开发模式
    var developMode = {
        js:{
            base: "http://vod.test.com/js/",
            min: false,
            debugFile: false
        },
        debug: true,
        localDebug: true,
        runEnv: "custom"
    };

    // 测试模式
    var testMode = {
        js:{
            min: false,
            debugFile: false
        },
        debug: true,
        runEnv: "test"
    };

    // 所有情景模式
    var gModeConfig = {
        custom: customMode,
        develop: developMode,
        test: testMode
    };


    var RootJS = "../source/js/";
    var RootDoc = "../source/doc/";
    var RootSource = "../source/";
    var extension2Root = "";
    //var RootExport = ".."+ extension2Root +"/export/debug/page/extension/";
    //var RootExport = "../../extension/";
    var RootExport = "D:/webserver/cloud.vod/vod.front/export/debug/page/extension/"

    var async = require('async');
    var spmBuild = require('spm').getAction('build');
    var shelljs = require('shelljs');
    var extend = require('node.extend');


    // 制作全局的alias
    var jsAlias = {};     // js编译用的alias
    var docAlias = {};    // html编译用的alias

    var project = {
        config: gConfig,
        init: function(){
            var projConfig = this.config;
            // 处理下定义的版本号
            var Ver = projConfig.ver;
            Ver.appVer = Ver.AppVer + "." + Ver.PubVer;
            Ver.cssVer = Ver.CssVer + "." + Ver.PubVer;
            Ver.pubVer = Ver.PubVer;

            // 是否需要改变配置
            if(projConfig.mode && gModeConfig[projConfig.mode]){
                projConfig = extend(true, projConfig, gModeConfig[projConfig.mode]);
            }


            // 复制资源
            this.copyRes();

            // 输出全部alias
            jsAlias = this.exportAlias(projConfig.ver.FolderVer);
            docAlias = jsAlias;
            // 调试模式时，自动设置spm编译版本号为空，js直接从源码中获取
            if(projConfig.localDebug){
                var folderVer = "";
                docAlias = this.exportAlias(folderVer);
            }



            // 编译js代码
            this.buildJS();

            // 拷贝html，css，编译html
            this.buildDoc();

        },
        exportAlias: function(folderVer){
            folderVer = folderVer ? folderVer + "/" : "";

            var Alias = {};

            var createAlias = function(names, base){
                var alias = {};

                for(var i=0; i<names.length; ++i){
                    var key = names[i] || "";
                    if(key){
                        var value = base + key + "/" + folderVer + key;
                        alias[key] = value;
                    }

                }

                return alias;
            };

            // appRoot的别名
            Alias.appRoot = "app/";

            // Gallery的js文件
            var galleryItems = ["jquery", "json"];
            var galleryBase = "gallery/";
            var galleryAlias = createAlias(galleryItems, galleryBase);
            console.info('galleryAlias', galleryAlias);
            Alias = extend(Alias, galleryAlias);

            // Common的js文件
            var commonItems = ["iscroll", "login", "utils", "event", "event_types"];
            var commonBase = "common/";
            var commonAlias = createAlias(commonItems, commonBase);
            console.info('commonAlias', galleryAlias);
            Alias = extend(Alias, commonAlias);

            // App的js文件
            var appItems = ["index", "components", "modules"];
            var appBase = "app/";
            var appAlias = createAlias(appItems, appBase);
            console.info('appAlias', appAlias);
            Alias = extend(Alias, appAlias);

            console.info('Alias', Alias);

            return Alias;
        },
        // 生成spm config的函数
        genSpmConfig: function(option){
            var projConfig = this.config;
            var folderVer = projConfig.ver.FolderVer;

            var defaultOptions = {
                root:"",
                baseSource: "",
                baseExport: "",
                alias: {},
                min: false,
                debugFile: true,
                items: []
            };

            option = extend(true, defaultOptions, option);

            var items = option.items;

            var funcArr = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var spmConfig = {
                    base: option.baseSource + '/' + option.root + '/' + item.name + '/',
                    // "source": ["~/sources"],
                    // "compress-options": "reserved,beautify",
                    baseModInfo: {
                        name: item.name,    // base
                        version: folderVer,
                        output: item.output,
                        root: option.root,    // gallery
                        dependencies: option.alias,
                        spmConfig: {
                            "*": {
                                // "idRule": "{{root}}/{{name}}/{{moduleName}}",
                                "with-debug": "debug"
                            },
                            "build": {
                                // "skip": "min",
                                "src": ".",
                                "to": option.baseExport + '/js/' + option.root + '/' +item.name + '/' + folderVer
                            }
                        }
                    }
                };


                // 是否压缩文件
                if(!option.min)
                    spmConfig.baseModInfo.spmConfig.build["skip"] = "min";

                // 是否生成debug文件
                if(!option.debugFile)
                    spmConfig.baseModInfo.spmConfig["*"]["with-debug"] = "";

                funcArr.push(spmConfig);
            }

            return funcArr;
        },
        buildJsMod:function(options, topCallback){
            topCallback = (typeof topCallback == "function") ? topCallback : function(){};

            if(options.length <= 0)
                return ;

            // 公共的执行函数
            var execFunc = function(callback){
                if(options.length <= 0)
                    return ;

                var option = options[0];
                // 执行
                spmBuild.run(option, function() {
                    // console.info('success');
                    callback(null, option.baseModInfo.name);
                });

                // 执行后从options中移除
                options.shift();
            };

            // 执行function列表
            var arrFunc = [];
            for (var i = 0; i < options.length; i++) {
                arrFunc.push(execFunc);
            }

            // 异步变同步
            async.series(arrFunc, function(err, results){
                console.info('mod success');
                console.info('results:', results);
                topCallback();
            });
        },
        buildJS: function(){
            var that = this;
            var projConfig = this.config;
            var min = projConfig.js.min;
            var debugFile = projConfig.js.debugFile;

            // 公共配置
            var baseConfig = {
                root:"",
                baseSource: RootJS,
                baseExport: RootExport,
                alias: jsAlias,
                min: min,
                debugFile: debugFile,
                items: []
            };

            // 生成gallery的配置
            var cfg2Gallery = extend(true, {}, baseConfig, {
                root: "gallery",
                items:[
                    { name: "json", output: { "json.js": "." } },
                    { name: "jquery", output: { "jquery.js": "." } }
                ]
            });
            cfg2Gallery = this.genSpmConfig(cfg2Gallery);
            // console.info('cfg2Gallery:', cfg2Gallery);


            // 生成common的配置
            var cfg2Common = extend(true, {}, baseConfig, {
                root: "common",
                items:[
                    { name: "event", output: { "event.js": "."}},
                    { name: "event_types", output: { "event_types.js": "."}},
                    { name: "iscroll", output: { "iscroll.js": "." } },
                    { name: "utils", output: { "utils.js": "." } },
                    { name: "login", output: { "login.js": "." } }
                ]
            });
            cfg2Common = this.genSpmConfig(cfg2Common);
            // console.info('cfg2Common:', cfg2Common);


            // 生成app的配置
            var cfg2App = extend(true, {}, baseConfig, {
                root: "app",
                items:[
                    { name: "components", output: { "components.js": "."} },
                    { name: "modules", output: { "modules.js": "." } },
                    { name: "index", output: { "index.js":['./index.js',"json","jquery",
                                                            "event","event_types","iscroll",
                                                            "utils","login","components","modules"] } }
                ]
            });
            cfg2App = this.genSpmConfig(cfg2App);
            // console.info('cfg2App:', cfg2App);

            // 异步变同步
            async.series([
                ///*
                function(callback){
                    that.buildJsMod(cfg2Gallery, callback);
                },
                function(callback){
                    that.buildJsMod(cfg2Common, callback);
                },
                //*/
                function(callback){
                    that.buildJsMod(cfg2App, callback);
                }
            ],
                function(err, results){
                    console.info('all success');
                    // console.info('results:', results);
            });

        },
        // 基础编译(一些公用的版本号，配置，参数)
        basisCompile: function(option){
            var defaultOptions = {
                rootSource: "",
                rootExport: RootExport,
                items: []
            };

            option = extend(defaultOptions, option);


            var projConfig = this.config;

            var ejs = require('ejs');
            var fs = require('fs');
            // console.log("ejs:", ejs);

            // 获取版本号
            var appVer = projConfig.ver.appVer;
            var cssVer = projConfig.ver.cssVer;
            var pubVer = projConfig.ver.pubVer;
            // js base路径
            var jsBasePath = projConfig.js.base;
            // debug打印是否开启
            var debug = projConfig.debug;
            // 本地调试项
            var localDebug = projConfig.localDebug;
            // 运行环境
            var runEnv = projConfig.runEnv;


            // 循环处理
            var items = option.items;
            for(var i=0; i<items.length; ++i){
                var mod = items[i];
                console.log('!!!!!!!! mod:', mod);
                // console.log("mod:", mod);
                var fileAddr = option.rootSource + mod.addr;
                var tpl = fs.readFileSync(fileAddr, "utf-8");
                var seajs = "http://vod.xunlei.com/page/extension/js/seajs/sea.js";

                var desMod = {
                    entry:"",
                    alias:{}
                };

                // 填入entry
                desMod.entry = docAlias[mod.entry] || mod.entry;
                desMod.appRoot = docAlias.appRoot;
                // 填入version
                desMod.AppVer = appVer;
                desMod.PubVer = pubVer;
                // 填入base
                desMod.base = jsBasePath;
                // 填入debug
                desMod.debug = debug;
                // 填入全局配置
                desMod.gCloudVod = {};
                if(runEnv)
                    desMod.gCloudVod.runEnv = runEnv;    // 填入运行环境
                // 填入定义的上报等级
                if(typeof (projConfig.defStatLevel) == "number")
                    desMod.gCloudVod.defStatLevel = projConfig.defStatLevel;
                // 填入版本号
                desMod.gCloudVod.AppVer = appVer;

                // 映射alias
                for(name in mod.alias){
                    console.log("name:", name);
                    if(docAlias[name]){
                        desMod.alias[name] = docAlias[name];
                    }
                    else{
                        desMod.alias[name] = name;
                    }

                }

                // 根据localDebug确定是否生成全局alias,保证为编译的id解析正确
                if(localDebug)
                    desMod.alias = docAlias;

                // 将对象转换为字符串
                var modConfig = JSON.stringify(desMod, "", 4);

                // console.log("modConfig:", desMod);
                // 制作模版
                var html = ejs.render(tpl, {
                    proj:{
                        AppVer: "v=" + appVer,
                        CssVer: "v=" + cssVer,
                        PubVer: "v=" + pubVer,
                        seajsPath: seajs,
                        modConfig: modConfig
                    }
                });
                // console.log("html:", html);

                // 输出html
                fs.writeFileSync(option.rootExport + mod.addr, html, "utf-8");
            }

        },
        buildDoc: function(){
            // 复制html文件
            var fromDir = RootDoc;
            var toDir = RootExport;
            shelljs.cp("-rf", fromDir, toDir);


            // 读取需要编译的文件列表
            var entryConfig = require('./entry-config.js');
            // console.log("entryConfig:", entryConfig);

            // 编译html文件
            this.basisCompile({
                rootSource: RootDoc,
                items: entryConfig.doc
            });
        },
        copyRes: function(){
            // 新建export
            shelljs.mkdir("-p", RootExport);

            // 复制seajs
            var fromDir = RootJS + "seajs";
            var toDir = RootExport + "js/";
            shelljs.mkdir(toDir);
            shelljs.cp("-rf", fromDir, toDir);

            // 是否需要压缩版的seajs
            var projConfig = this.config;
            if(projConfig.js.min){
                var fromFile = RootJS + "seajs/sea-min.js";
                var toFile = RootExport + "js/seajs/sea.js";
                shelljs.cp("-f", fromFile, toFile);
            }


            // 复制gallery
            /*
             var fromDir = RootJS + "gallery";
             var toDir = RootExport + "js/";
             shelljs.cp("-rf", fromDir, toDir);
            */
        }
    };

    project.init();


})();