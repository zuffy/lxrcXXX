(function(win) {
    
    var vodConfigs = {
        domPrefix: '_XL_Vod',
        topzIndex : 2147483648,
        //loading 部分html
        loadingHTML:'<div id="_LoaddingTips" style="width:573px;margin:30% 0 0 0;">\
                        <p style="line-height:24px;text-align:center;padding:40px 0 0;">\
                        <img src="' + chrome.extension.getURL("img/loading.gif") + '" alt="" style="vertical-align:-7px;" />正在努力查找视频下载资源...</p>\
                        <p style="display:none;line-height:24px;text-align:center;padding:40px 0 0;">\
                        <img src="' + chrome.extension.getURL("img/face01.gif") + '" alt="" />当前页面没有找到支持云播放的视频下载资源…</p>\
                     </div>',
        //header部分html
        headerHtml:'<h1 style="padding:13px 0 0 15px;margin:0;z-index:9999991;position:absolute;">\
                        <a href="http://vod.xunlei.com" target="_blank" title="迅雷云播" style="display:block;width:130px;height:27px;background:url(' + chrome.extension.getURL("img/spr_ico.png") + ') 0 0 no-repeat;text-indent:-9999px;z-index:9999992;position:relative">迅雷云播</a>\
                    </h1>\
                    <a id="dragBar" style="display:block;width:100%;height:45px;cursor:auto;z-index:999999;position:relative;"></a>\
                    <a id="panelClose" href="javascript:;" title="关闭" style="font-size:14px;background:url(' + chrome.extension.getURL("img/spr_ico.png") + ') no-repeat;overflow:hidden;\
                    display:block;position:absolute;top:7px;right:8px;width:87px;height:30px;line-height:30px;text-align:center;color:#424242;background-position:0 -120px;z-index:9999993;">关闭</a>',
        //面板的样式;
        panelStyle:'width:600px;height:502px;position:fixed;right:50px;top:50px;font:12px/1.5 tahoma, \\5B8B\\4F53;box-shadow: 0 0 4px rgba(0, 0, 0, .5);z-index:2147483647;margin:0',
        css: {
            contentDivCss: 'width:598px;height:502px;border: 1px solid #378fd0;border-top:none;box-shadow:0 0 4px rgba(0,0,0,.5);position:relative;top:-45px;'
        ,   view: '*zoom:1;width:100%;height:502px;'
        ,   header :'width:600px;height:45px;background:url(' + chrome.extension.getURL("img/ybx_hd.png") + ') no-repeat 0 0;position:relative;font-family:\\5FAE\\8F6F\\96C5\\9ED1;'
        ,   loading_view : 'position:absolute;width:594px;height:456px;min-height:456px;background:#fff;top:45px;padding:2;'
        }
    }
	,	globalTabIndex
    ,   _conflict = null
    ,   vApp = null
    //需要捕获的视频格式
    ,   videoExt = ['rmvb', 'mp4', 'mkv', 'avi', 'wmv', 'rm',
                    'flv' , '3gp', 'ts' , 'asf', 'mpg', 'mov', 
                    'mpeg', 'm4v', 'vob', 'xv' , 'f4v'].join('|');

    typeof VodExtension != "undefined" && (_conflict = VodExtension), VodExtension = {}

    // 管理数据的模块
    var GData = function (){
        this.init();
    };
    $.extend(GData.prototype, {
        init:function(){
            var self = this;
            self.searchTime = new Date().getTime();
            self.locationObj = document.location;
            self.href = document.location.href
            self.linksNum = 0;
            self.resources = [];
            self.cacheResources = [];
            self.run();
        },
       
        //整理页面数据;
        run : function (){
            var pageHtml = $('body').html()
            ,   call = arguments.callee;
            //必须等到页面加载好
            if( !pageHtml ){
                setTimeout(function(){
                    call();
                },50)
                return;
            }
            
            var data = PageAnalyser.analysePage(pageHtml, function(_length){
                !!vApp && (vApp.foundNewLinks = 1);
                chrome.extension.sendRequest({
                    id: globalTabIndex,
                    num: _length,
                    result: 'foundLinks'
                });
            });
            this.resources;
            this.queryData = data ||{
                time : this.searchTime,
                source : JSON.stringify(this.locationObj),
                page : Common.encode( self.pageHtml ),
                listNum : 0,
                resources : []
            }
            this._strData = JSON.stringify( this.queryData );
        },
        //字符串数据;
        strData: function(){
            return this._strData;
        }
    });

    //管理面板的view结构
    VodExtension.VodPanel = function() {
        this.init()
    };
    $.extend(VodExtension.VodPanel.prototype, {
        
        view : null,    //panel view 对象
        frm:null,       //iframe对象
        loadSuccess:0,  //iframe加载完成;

        close: function() {
            this.wrapper.hide();
            //this.deleteFrame()
        },

        show : function(){
            this.wrapper.show();
        },

        loadPage: function(url) {
            var url = vodConfigs.innerPage
            ,   nocahe = new Date().getTime()
            ,   self = this;
            this.loadingView.show(), 
            url +=/*'?t='+nocahe+*/'#';
            self.frm.attr('src', '' + url);
        },

        initFrame: function() {
            var e = vodConfigs
            ,   inner = '<iframe width="100%" height="100%" border="0" frameborder="0" \
                                    src="javascript:document.write(\'\');" \
                                    style="width:100%;height:100%;border:0px"  \
                                    id="' + e.domPrefix + 'ContentFrame" \
                                    name="' + e.domPrefix + 'ContentFrame" \
                                    scrolling ="no"></iframe>';
            this.view.html(inner);
            this.frm = $('#'+ e.domPrefix + "ContentFrame");

            this.frm && vApp && !vApp.isBind && (
                this.frm.unbind('load').bind('load', function(e) {
                    loadSuccess = 1;
                    vApp.foundNewLinks = 0;
                    vApp.fireEvent( VodExtension.App.FrameLoadedEvent, {} );
                }),
                vApp.isBind = !0);
        },

        deleteFrame: function() {
            this.view.html("");
        },

        getFrame:function(){
            return this.frm || (this.frm = $('#'+ vodConfigs.domPrefix + "ContentFrame"));
        },

        init: function() {
            Common.log("Init VodPanel Class")
            var e = vodConfigs, 
            panelId = "vodExtensionPanel", 
            r = $( '#' + panelId )[0];
            r != null && r.parentNode != null && r.parentNode.removeChild(r);
            
            var panel = Common.mkel("div");
            panel.id = panelId, 
            panel.name = panelId, 
            panel.style.cssText = e.panelStyle, 
            panel.style.zIndex = vodConfigs.topzIndex; 
            
            var panelHeader = Common.mkel("div", panel);
            panelHeader.id = "vodExtensionPanel_header", 
            panelHeader.name = "vodExtensionPanel_header", 
            panelHeader.style.cssText = e.css.header;
            panelHeader.innerHTML = e.headerHtml;
            
            var contentDiv = Common.mkel("div", panel);
            contentDiv.style.cssText = e.css.contentDivCss, 
            contentDiv.id = "vodExtensionPanel_Content", 
            contentDiv.className = "vod-content";

            var o = Common.mkel("div", contentDiv);
            o.id = "vodExtensionPanel_view";
            o.name = "vodExtensionPanel_view";
            o.style.cssText = e.css.view;
            
            var div = Common.mkel("div", contentDiv);
            div.style.cssText = e.css.loading_view, 
            div.innerHTML = e.loadingHTML, div.style.display = "none", 
            div.name = "vodExtensionPanel_loadview", 
            div.id = "vodExtensionPanel_loadview";
            
            window.document.body.appendChild(panel)
            this.wrapper = $(panel);
            this.view = $(o);
            this.loadingView = $(div);

            $('#panelClose').hover(function(){
                $(this).css('background-position','0 -150px');
            },function(){
                $(this).css('background-position','0 -120px');
            }).click(function(){
                vApp.fireEvent( VodExtension.App.FrameCloseEvent, {} );
            });

            //调整位置
            var top = (document.documentElement.clientHeight-panel.offsetHeight)/2;
            var left = (document.documentElement.clientWidth-panel.offsetWidth)/2;
            top = top > 0 ? top : 0;
            left = left > 0 ? left : 0;
            panel.style.top = top + "px"; 
            panel.style.left= left+ "px"; 

            //支持拖动的功能;
            Drag.init({ 
                handler : $('#dragBar')[0], 
                root : panel 
            });      
            $('#dragBar').mousedown(function(){
                $(this).css({'height':'362px'/*,'background':'red'*/});
            }).mouseup(function(){
                $(this).css('height','45px');
            }).unbind('mousewheel').bind('mousewheel', function(){
                return false;
            })
            this.wrapper.unbind('mousewheel').bind('mousewheel', function(){
                return false;
            })
        },

        reset: function() {
            Common.log("Call Reset!"), 
            this.selection = null, 
            this.range = null, 
            this.wrapper.show();
            (!!this.view.html()) && this.deleteFrame(), 
            this.initFrame()
        }
    });


    VodExtension.VodManager = function() {
        this.init()
    };
    $.extend(VodExtension.VodManager.prototype, {

        run: function(inited) {
            if( inited ){
                this.vodPanel.show();
                return;
            }

            Common.log("start run..");
            Common.serverlog(0);
            this.vodPanel.reset();
            this.vodPanel.loadPage()
        },

        init: function() {
            this.addEventListeners();
            this.vodPanel = new VodExtension.VodPanel
        },

        addEventListeners: function (){
            var self = this;
            vApp.attachEvent( VodExtension.App.FrameLoadedEvent, function() {
                if(!arguments[2]) return;
                var eParam = arguments[2]
                self.frameLoadedHandler();
            });
            vApp.attachEvent( VodExtension.App.FrameCloseEvent, function() {
                if(!arguments[2]) return;
                var eParam = arguments[2]
                self.frameclose();
            });
            
        },

        frameclose: function(){
            this.vodPanel.close();
        },

        frameLoadedHandler: function(){
            Common.log("Enter framehandler ");
            var pnl = this.vodPanel
            pnl.loadingView.hide()
            pnl.getFrame().attr('src',vodConfigs.innerPage + '#' + VodExtension.gData.strData());
            setTimeout(function(){
                pnl.getFrame().attr('src',vodConfigs.innerPage + '#');
            },10)
        }

    });


    VodExtension.App = function() {
        this.init();
    }; 
    $.extend(VodExtension.App, {
        foundNewLinks : 0,
        FrameLoadedEvent:"frameloaded",
        FrameCloseEvent:'frameclose'
    });
    VodExtension.App.prototype = {

        run: function() {
            Common.log("VodExtension Run...");
            
            if (typeof this.vodManager == "undefined")
                try {
                    this.vodManager = new VodExtension.VodManager
                } catch (e) {
                    Common.log("Exception:" + e)
            }
            this.vodManager.run()
        },

        showApp : function(){
            this.vodManager.run( !0 );
        },

        init : function() {
            this.attachEvent = this.addEventListener;
            this.detachEvent = this.removeEventListener;
            this.fireEvent = this.dispatchEvent;
            this.events = {};
        },

        addEventListener : function(sEvent, fpNotify, tDelay) {
            if(!this.events[sEvent])
                this.events[sEvent] = [];
            for(var i = 0; i < this.events[sEvent].length; i++)
            if(this.events[sEvent][i].o == this && this.events[sEvent][i].f == fpNotify)
                return true;
            this.events[sEvent].push({
                o : this,
                f : fpNotify,
                t : tDelay
            });
            return this;
        },

        removeEventListener : function(sEvent, fpNotify) {
            if(!this.events[sEvent] || !(this.events[sEvent] instanceof Array))
                return false;
            for(var i = 0; i < this.events[sEvent].length; i++)
            if(this.events[sEvent][i].o == this && this.events[sEvent][i].f == fpNotify) {
                this.events[sEvent].splice(i, 1);
                if(0 == this.events[sEvent].length)
                    delete this.events[sEvent];
                return this;
            }
            return this;
        },

        dispatchEvent : function(sEvent) {
            if(!this.events[sEvent] || !(this.events[sEvent] instanceof Array))
                return false;
            var args = [this].concat(this.argumentsToArray(arguments));
            var listener = this.events[sEvent].slice(0);
            for(var i = 0; i < listener.length; i++)
            if( typeof (listener[i].t) == "number")
                listener[i].f.delayApply(listener[i].t, listener[i].o, args);
            else
                listener[i].f.apply(listener[i].o, args);
            return this;
        },

        argumentsToArray : function(args) {
            var result = [];
            for(var i = 0; i < args.length; i++)
            result.push(args[i]);
            return result;
        }
    };

    Common.log("-----------------------app start-------------------------");
    //只有数据准备好后才能显示ui;
    var timeId = null
    ,   loop = function() {
        Common.log("enter loopFunc:");
        document.readyState !== "complete" && 
        document.readyState != "loaded" && 
        document.readyState != "interactive" || 
        !document.body || 
        !VodExtension.gData ? 
        timeId = setTimeout(loop, 300) : 
        function(){
            if( !vApp ){
                vApp = new VodExtension.App,
                vApp.run()    
            }
            else{
                vApp.foundNewLinks ? vApp.run() : vApp.showApp();
            }
        }();
    };

    //监听插件发送过来的消息;
    chrome.extension.onRequest.addListener(function(msg, sender, sendResponse) {
        //执行程序;
        if( msg.msg == 'tabAction' ){
            if( msg.act === "contextMenu" || msg.act === "browser" ) {
                    vodConfigs.innerPage = "http://vod.xunlei.com/page/extension/index.html";
                    vodConfigs.panelStyle.replace(/display;none;/g, "");
                    loop()
                    sendResponse('acted');
            }

        }
        //contentScript初始化数据。
        else if( msg.msg == 'initTabId' ){
            VodExtension.gData = new GData();
        }
    })
    //先经过contentScript请求后才能开始程序;
    chrome.extension.sendRequest({
        result: 'whoami',
        url : location.href
    });
    //绑定窗口关闭事件;
    try{
        $(window).unbind('unload').bind('unload',function(){
            chrome.extension.sendRequest({
                id: globalTabIndex,
                result: 'initLinks'
            });
        })
    }catch(e){
        Common.log(e)
    }

})(window);