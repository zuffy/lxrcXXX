define(function(require){
    var $ = require('jquery');
    var debug = 0;
    var jQuery = $;
    var userID;
    var BasicTools = {
        debug : debug,
        /*  判断浏览器类型
        *
        *   @param  uaName 浏览器类型名称,全部小写 chrome、ie、firefox、ie6...
        */
        isUA : function(uaName){
            uaName = uaName.replace('ie','MSIE ');
            var ua = window.navigator.userAgent.toLowerCase();
            var exp =  new RegExp(uaName,'i');
            return exp.test(ua);
        },
        inArray : function ( arr, item ){
            if( typeof arr.indexOf != 'undefined' ){
                return arr.indexOf(item) > -1;
            }
            else{
                for (var i = arr.length - 1; i >= 0; i--) {
                    if ( arr[i] == item )return true;
                };
                return false;
            }
        },

    	decode : function(str) {
	        var r = '';
	        try {r = decodeURIComponent(decodeURIComponent(str));   } catch(e) {
	            try {r = decodeURIComponent(str);} catch(e) {r = str;}
	        }
	        return r;
	    },
	    encode : function(str) {
	        return encodeURIComponent(str);
	    },
	    isLogin : function(){
            var uid = this.getCookie('userid');
            var ret = this.getCookie('sessionid') && uid;
            return ret;
	    },
	    getCookie : function(name) {
			return (document.cookie.match(new RegExp("(^" + name + "| " + name + ")=([^;]*)")) == null) ? "" : decodeURIComponent(RegExp.$2);
		},
		setCookie:function(name,value,sec){
			var domain = document.location.host;
			if(arguments.length>2){
				var expireDate=new Date(new Date().getTime()+sec*1000);
				document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain+"; expires=" + expireDate.toGMTString() ;
			}else
			document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain;
		},
        setGdCookie : function(name, value, sec) {
            if(arguments.length > 2) {
                var expireDate = new Date(new Date().getTime() + sec * 1000);
                document.cookie = name + "=" + escape(value) + "; path=/; domain=xunlei.com; expires=" + expireDate.toGMTString();
            } else
                document.cookie = name + "=" + escape(value) + "; path=/; domain=xunlei.com";
        },
        /* 获取文件名，可能含扩展名 */
        getFileName : function(url){
            var that = this;
            var _url = that.decode(url); 
            
            if( _url.indexOf('ed2k') ===0 ){
                //解析ed2k
                var _leftString = _url.substr( _url.indexOf('ed2k://|file|') + 13, _url.length );
                return _leftString.substr( 0, _leftString.indexOf('|') );

            }else if( _url.indexOf('thunder') === 0){
                return url;
                // 解析thunder
                _url = _url.replace( "thunder://", "" );
                //console.log([ 'getFileName thunder_url cut thunder://', _url ]);
                _url = that.base64decode(_url).replace( /^AA|ZZ$/gi, "" );
                //console.log([ 'getFileName base64decode thunder_url', _url ]);
                return arguments.callee(_url);

            }else if( _url.lastIndexOf('/') != -1 ){
                //console.log([ 'getFileName url3', _url ]);
                return _url.substr( _url.lastIndexOf('/') + 1, _url.length );

            }else{
                return _url;
            }
        },
        /* 获取文件的扩展名 */
        getFileExt : function(str){
            var _str = this.decode(str);
            return _str.substr( _str.lastIndexOf('.') + 1, _str.length );
        },
        /*
        *   shorten name;
        */
        toShortName: function(name, h, q, k) {
            for (var m = 0, l = 0; m < name.length; ++m, ++l) {
                if (name.charCodeAt(m) > 255) {
                    ++l
                }
            }
            if (l <= h) {
                return name
            }
            for (var m = 0, l = 0; m < q; ++m, ++l) {
                if (name.charCodeAt(l) > 255) {
                    ++m
                }
            }
            var n = name.substr(0, l);
            for (var m = 0, l = 0; m < k; ++m, ++l) {
                var o = name.length - l - 1;
                if (name.charCodeAt(o) > 255) {
                    ++m
                }
            }
            var r = name.substring(name.length - l);
            return n + " ... " + r
        },

        getCurrentThunder : function(){
            var userid = this.getCookie('userid') || userID;
            if(userid)
                this.setCookie("userid", userid, 15*24*3600);
            return Thunder.getInstance();
        },

        log : function (str){
            this.debug && console.log(str);
        }

    };

    var Thunder = {
        getInstance: function(){
            var opt = [Thunder.Thunder5, Thunder.WebThunder,Thunder.Mac];
            for (var i=0; i<opt.length; i++){
                try{
                    return opt[i].getInstance();
                }catch(e){
                    continue;
                }
            }
            return null;
            throw "迅雷初始化失败";
        },
        
        setParameter: function(cid, url, refer, stat){
            var inputs = ["thunder_cid", "thunder_down_url", "thunder_down_pageurl", "thunder_stat_pageurl"];
            for (var i=0; i<inputs.length; i++){
                var input = $(inputs[i]);       
                if (isUndef(input) || isNull(input)){
                    input = document.createElement("input");
                    input.type = "hidden";
                    input.id = inputs[i];
                    document.body.appendChild(input);
                }
                input.value = arguments[i];
            }
        },
        
        download: function(cid, url, refer, name, stat){
            this.getInstance().download(cid, url, refer, name, stat);
        },
        
        batchDownload: function(data, stat){
            this.getInstance().batchDownload(data, stat);
        }
    }
    var Class={create:function(){return function(){this.initialize.apply(this,arguments);};}}
    Thunder.WebThunder = Class.create();
    Thunder.WebThunder.getInstance = function(){
        return new Thunder.WebThunder();
    }
    Thunder.WebThunder.prototype = {    
        initialize: function(){
            this.__thunder = new ActiveXObject("ThunderServer.webThunder.1");
        },
        
        getVersion: function(){
            return parseInt(this.__thunder.GetVersion().split(".")[3]);
        },

        _whd:function (s){
           return s.replace(/<br>/g,"\n").replace(/&lt/g,"<").replace(
                    /&gt/g,">"
                ).replace(/&quot/g,"\"").replace(/&apos/g,"\'").replace(/&amp/g,"&");
        },
        
        download: function(cid, url, refer, name, stat){
            this.__thunder.CallAddTask(this._whd(url), name, this._whd(refer), 1, cid, stat);
            return 0;
        },
        
        batchDownload: function(data, stat){
            var batchTask = this.__thunder.BeginBatchTask();
            if(batchTask == 0){
                alert("批量下载初始化失败");
                return;
            }
            var version = this.getVersion();
            for(var i=0; i<data.length; i++){
                if (version < 43)
                    this.__thunder.AddTaskToBatch(batchTask, data[i].url, data[i].name, data[i].refer);
                else if (version < 54)
                    this.__thunder.AddTaskToBatch(batchTask, data[i].url, data[i].name, data[i].refer, data[i].cid);    
                else
                    this.__thunder.AddTaskToBatch(batchTask, data[i].url, data[i].name, data[i].refer, data[i].cid, stat);  
            }
            this.__thunder.EndBatchTask(batchTask); 
        }
    }
    var Delegate=
    { 
      create:function(_8,_9)
     {
        var f=function()
         {
             var _b=arguments.callee.target;
             var _c=arguments.callee.func;
             return _c.apply(_b,arguments);
         };
         f.target=_8;
         f.func=_9;
         return f;
      }
    };
    Thunder.Thunder5 = Class.create();
    Thunder.Thunder5.getInstance = function(){
        if ( typeof this._thunder == "undefined")
            this._thunder = new Thunder.Thunder5();
        return this._thunder;
    }
    Thunder.Thunder5.prototype = {
        initialize: function(){
            this.__thunder = new ActiveXObject("ThunderAgent.Agent.1");
        },
        
        download: function(cid, url, refer, name, stat, cloud){
            try{
                this.addTask(cid, url, refer, name, stat, cloud);
                this.commitTasks();
            }catch(e){
                alert('请安装迅雷7');
            }
        },
        
        batchDownload: function(data, stat){
            try{
                for(i=0; i<data.length; i++)
                    this.addTask(data[i].cid, data[i].url, data[i].refer, data[i].name, stat);
                this.commitTasks();
            }catch(e){
                alert(e.message);
            }
        },
        
        addTask: function(cid, url, refer, name, stat, cloud){
            var _addTask = [
                Delegate.create(this, function(){this.__thunder.AddTask4(url, name, "", name, refer, -1, 0, -1, "", cid, stat);}),
                Delegate.create(this, function(){this.__thunder.AddTask3(url, name, "", name, refer, -1, 0, -1, "", cid);}),
                Delegate.create(this, function(){this.__thunder.AddTask2(url, name, "", name, refer, -1, 0, -1, "");}),
                Delegate.create(this, function(){this.__thunder.AddTask(url, name, "", name, refer, -1, 0, -1);})
            ];
            for (var i=0; i<_addTask.length; i++){
                try{
                    _addTask[i]();
                    return;
                }catch(e){  
                }
            }
            throw "不支持此方法，请安装最新的迅雷客户端";
        },
        
        commitTasks: function(){
            var _commitTasks = [
                Delegate.create(this, function(){this.__thunder.CommitTasks2(1);}),
                Delegate.create(this, function(){this.__thunder.CommitTasks();})
            ];
            for (var i=0; i<_commitTasks.length; i++){
                try{
                    _commitTasks[i]();
                    return;
                }catch(e){
                }
            }
            throw "不支持此方法，请安装最新的迅雷客户端";
        }
    }

    Thunder.Mac = Class.create();
    Thunder.Mac.getInstance = function(){
        if(navigator.platform.indexOf("Mac") != -1){
            return new Thunder.Mac();
        }
        else {
            throw new Error('Not Mac');
        }
    }
    Thunder.Mac.prototype = {
        initialize: function(){
            
        },
        download: function(cid, url, refer, name, stat, cloud){
            try{
                var refer_url = refer;
                var cookie = document.cookie;
                var filename = name;
                var browserName=navigator.userAgent.toLowerCase();
                var is_chrome = /chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName);
                var is_safari = /webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName));
                if(is_chrome || is_safari){ //浏览器为safari 或者chrome
                     var plugin = document.getElementById("xunlei_com_thunder_helper_plugin_d462f475-c18e-46be-bd10-327458d045bd");
                     if(plugin != null && plugin.DownloadLixian != null && plugin.DownloadLixian != undefined){
                         var ret = plugin.DownloadLixian(url,refer_url,cookie,filename);
                         if(ret){
                           return;
                         }
                     }
                    else{
                       location.href = url;
                    }
                }
                else if(/firefox/i.test(browserName)){ //firefox
                    var plugin = document.getElementById("xunlei_com_thunder_helper_plugin_d462f475-c18e-46be-bd10-327458d045bd");
                    if(plugin != null){
                         var element = document.createElement("ThunderExtensionDataElement");
                         element.setAttribute("url", url);
                         element.setAttribute("refer_url", refer_url);
                         element.setAttribute("filename",filename);
                         element.setAttribute("cookie",cookie);
                         document.documentElement.appendChild(element);
                         var evt = document.createEvent("Events");
                         evt.initEvent("ThunderDownloadLixianExtensionEvent", true, false);
                         element.dispatchEvent(evt);
                    }
                    else location.href = url;
                }
            }catch(e){
                alert('请安装Mac迅雷');
            }
        },
        batchDownload: function(data, stat){
            try{
                for(i=0; i<data.length; i++)
                    this.download(data[i].cid, data[i].url, data[i].refer, data[i].name, stat);
            }catch(e){
                alert(e.message);
            }
        }
    };


    return BasicTools;
})