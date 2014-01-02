/**	用户界面类
*	用于展示浮层的生成、事件绑定等
*	
*	@author zuffy
*	
*	注意：定义的方法名不要与tools.js重名
*   有些页面重写了$, jQuery的 unbind, bind 方法也出问题, 页面上尽量用原生方法实现.
*/
var lxrcUI = (function(){
	
	var domIdConfig = {
		baseLayerId : 'LXRC_baseLayer',	// 整个浮层的id
		message_info: 'message_info',	//提示层
		mes_close : 'mes_close',
		baseLayerIdCloseId : 'LXRC_baseLayerClose',	// 关闭浮层的id
		dataStatusTipsWrapId : 'LXRC_dataStatusTips',	// 展示页面状态的容器id
		dataWrapId : 'LXRC_dataWrap',	// 展示有效数据的容器id
		headButtonsWrapId : 'LXRC_headButtons',	// 展示顶栏操作按钮的容器id
		//headButtonsNames : ['vodPlay','lixianTask','xlDownload'],	// 顶栏操作按钮的名字:云点播、离线下载、迅雷下载
		headOptionsWrapId : 'LXRC_headOptions',	// 展示顶栏【全选】、【反选】等操作项的容器id
		//headOptionsNames : ['selectAll','selectReverse','resourcesTotalNum','speedResourcesNum','resourcesFrom'],	// 顶栏操作项的名字：全选、反选、文件总数、高速链接数、资源来源
		resourcesListWrapId : 'LXRC_resourcesList',
		resourcesListItemNames : ['speedDownloadIco','resourcesIco','resourceName','resourceSize','vodPlay','lixianTask','xlDownload']	// 资源列表每列操作项的名称：高速下载图标、资源类型图标、资源名称、资源大小、云点播、离线下载、迅雷下载
	};

    var sourceURL = "http://vod.xunlei.com/page/lxrc/";
    var urlCache = "?t=" + (new Date().getTime());
	var vodConfigs = {
        domPrefix: '_XL_Vod',
        topzIndex : 2147483648,
        //loading 部分html
        loadingHTML:'<div id="_LoaddingTips" style="width:598px;margin:30% 0 0 0;">\
                        <p style="line-height:24px;text-align:center;padding:40px 0 0;">\
                        <img src="' + sourceURL+ "img/loading.gif" + '" alt="" style="vertical-align:-7px;" />正在努力查找视频下载资源...</p>\
                        <p style="display:none;line-height:24px;text-align:center;padding:40px 0 0;">\
                        <img src="' +sourceURL+"img/face01.gif" + '" alt="" />当前页面没有找到支持云播放的视频下载资源…</p>\
                     </div>',
        //header部分html
        headerHtml:'<h1 style="padding:13px 0 0 15px;margin:0;z-index:9999992;position:absolute;outline:none;">\
                        <a href="http://vod.xunlei.com" target="_blank" title="迅雷云播" style="display:block;width:130px;height:27px;background:url(' +sourceURL+"img/spr_ico.png" + ') 0 0 no-repeat;text-indent:-9999px;z-index:9999992;position:relative;outline:none;" hideFocus="true">迅雷云播</a>\
                    </h1>\
                    <a id="dragBar" style="display:block;width:100%;height:45px;cursor:auto;z-index:9999991;position:relative;"></a>\
                    <a id="panelClose" href="javascript:;" title="关闭" style="font-size:14px;background:url(' + sourceURL+ "img/spr_ico.png" + ') no-repeat;overflow:hidden;\
                    display:block;position:absolute;top:7px;right:8px;width:87px;height:30px;line-height:30px;text-align:center;color:#424242;background-position:0 -120px;z-index:9999993;outline:none;"  hideFocus="true">关闭</a>',
        //面板的样式;
        panelStyle:'width:600px;height:502px;position:fixed;right:50px;top:50px;font:12px/1.5 tahoma, \\5B8B\\4F53;box-shadow: 0 0 4px rgba(0, 0, 0, .5);z-index:2147483647;margin:0',
        css: {
            contentDivCss: 'width:598px;height:502px;border: 1px solid #378fd0;border-top:none;box-shadow:0 0 4px rgba(0,0,0,.5);position:relative;top:-45px;z-index:1'
        ,   view: '*zoom:1;width:100%;height:502px;'
        ,   header :'width:600px;height:45px;background:url(' + sourceURL+ "img/ybx_hd.png" + ') no-repeat 0 0;position:relative;font-family:\\5FAE\\8F6F\\96C5\\9ED1;z-index:10'
        ,   loading_view : 'position:absolute;width:597px;height:456px;min-height:353px;background:#fff;top:45px;padding:2;'
        }
    }
    vodConfigs.innerPage = "http://vod.xunlei.com/page/extension/index.html";
	
	var pageTimes = 0;	
	
	var prototype = {
		init : function(){
			var that = this;
			this.loadExtLayer();

			return ;

			this.genBasicLayer();		
			
			this.from = this.shortenStr(document.location.href.replace('#lxrc',''),100);
			jQuery('#'+domIdConfig.headOptionsWrapId).find('[name=resourcesFrom]').html(this.from);
		},
		loadExtLayer : function (){
			//console.log("loadExtLayer")
            var e = vodConfigs, 
            	self = this,
            	panelId = "vodExtensionPanel", 
            	r = jQuery( '#' + panelId )[0];
            r != null && r.parentNode != null && r.parentNode.removeChild(r);
            
            var panel = this.mkel("div");
            panel.id = panelId, 
            panel.name = panelId, 
            panel.style.cssText = e.panelStyle, 
            panel.style.zIndex = vodConfigs.topzIndex; 
            
            var panelHeader = this.mkel("div", panel);
            panelHeader.id = "vodExtensionPanel_header", 
            panelHeader.name = "vodExtensionPanel_header", 
            panelHeader.style.cssText = e.css.header;
            panelHeader.innerHTML = e.headerHtml;
            
            var contentDiv = this.mkel("div", panel);
            contentDiv.style.cssText = e.css.contentDivCss, 
            contentDiv.id = "vodExtensionPanel_Content", 
            contentDiv.className = "vod-content";

            var o = this.mkel("div", contentDiv);
            o.id = "vodExtensionPanel_view";
            o.name = "vodExtensionPanel_view";
            o.style.cssText = e.css.view;
            
            var div = this.mkel("div", contentDiv);
            div.style.cssText = e.css.loading_view, 
            div.innerHTML = e.loadingHTML, div.style.display = "none", 
            div.name = "vodExtensionPanel_loadview", 
            div.id = "vodExtensionPanel_loadview";
            
            window.document.body.appendChild(panel)
            this.wrapper = jQuery(panel);
            this.view = jQuery(o);
            this.loadingView = jQuery(div);

            var clsBtn = jQuery('#panelClose');
            var ua = window.navigator.userAgent.toLowerCase();
            var exp =  new RegExp('MSIE (8)','i');
            if( exp.test(ua) ){
                clsBtn[0].onmouseenter = function(){
                    jQuery(this).css('background-position','0 -150px');
                }
                clsBtn[0].onmouseleave = function(){
                    jQuery(this).css('background-position','0 -120px');
                };
                clsBtn[0].onclick = function(){
                    self.wrapper.hide();
                    return false;
                };
            }
            clsBtn.hover(function(){
                jQuery(this).css('background-position','0 -150px');
            },function (){
                jQuery(this).css('background-position','0 -120px');
            }).bind('click',function (){
                self.wrapper.hide();
                    return false;
            });

            //调整位置
            var top = (document.documentElement.clientHeight-panel.offsetHeight)/2;
            var left = (document.documentElement.clientWidth-panel.offsetWidth)/2;
            top = top > 0 ? top : 0;
            left = left > 0 ? left : 0;
            panel.style.top = top + "px"; 
            panel.style.left= left+ "px"; 
            
            Drag.init({ 
                handler : jQuery('#dragBar')[0], 
                root : panel 
            });  
            var bar = jQuery('#dragBar');
            bar.mousedown(function(){
                jQuery(this).css({'height':'402px'/*,'background':'red'*/});
            })
            bar.mouseup(function(){
                jQuery(this).css('height','45px');
            })
            bar.bind('mousewheel', function(){
                return false;
            })
            this.wrapper.bind('mousewheel', function(){
                return false;
            })

            self.initFrame();
            setTimeout(function(){
            	self.loadPage()
            },10);
		},
		mkel : function(e, t) {
            try {
                var r = document.createElement(e);
                return t && t.appendChild(r), r
            } catch (i) {
                return !1
            }
        },

        initFrame: function() {
            var e = vodConfigs,
            	self = this,
            	inner = '<iframe width="100%" height="100%" border="0" frameborder="0" \
                                    src="javascript:document.write(\'\');" \
                                    style="width:100%;height:100%;border:0px"  \
                                    id="' + e.domPrefix + 'ContentFrame" \
                                    name="' + e.domPrefix + 'ContentFrame" \
                                    scrolling ="no"></iframe>';
            this.view.html(inner);
            this.frm = jQuery('#'+ e.domPrefix + "ContentFrame");
            var iframe = this.frm[0];
            var onloadFun = function(){
                jQuery('#vodExtensionPanel_loadview').hide();
                jQuery('#vodExtensionPanel_header').css('background','');
                if(!navigator.userAgent.match(/(MSIE|Firefox|chrome)/i)){
                    self.onframeLoaded();
                }
                else{
                    jQuery("#_ajaxPostFrom_").remove();
                    self.frm.unbind('load')
                }
            }
            if (iframe.attachEvent){
                iframe.attachEvent("onload", onloadFun);
            } else {
                iframe.onload = onloadFun;
            }

        },

        loadPage: function(url) {
            var url = vodConfigs.innerPage
            ,   nocahe = new Date().getTime()
            ,   self = this;
            this.loadingView.show();
            url +=/*'?t='+nocahe+*/urlCache+'#';   
            if(0 &&!navigator.userAgent.match(/(MSIE|Firefox|Chrome)/i)){
                self.frm.attr('src', '' + url);
            }
            else{
                //php 传输数据;
                //self.ajaxPost('http://vod.xunlei.com/page/lxrc/php/analyse.php',{'res':lxrcAnalyser.strData()});
                //self.ajaxPost('http://dynamic.vod.lixian.xunlei.com/analyse.php',{'res':lxrcAnalyser.strData()});
                self.ajaxPost('http://i.vod.xunlei.com/resource_assistant',{'res':lxrcAnalyser.strData()});
                //self.frm.attr('src', '' + url);
            }
        },
        show : function (){
            this.wrapper && this.wrapper.show();
        },
        onIEframeLoaded : function (){
            console.log('ie in frameloaded loop..')
            var self = this;
            var tmp = encodeURIComponent( lxrcAnalyser.strData() );
            var len = tmp.length;
            var step = 10
            var i = 0;
            var to = setTimeout(loop,200);
            function loop(){
                if( i < len ){
                    var sub = tmp.slice(i,i+step);
                    console.log('sub:'+i+sub)
                    self.frm.attr('src', vodConfigs.innerPage +urlCache+ '#' + sub);
                    i += step;
                    setTimeout(loop,10);
                }
                else{
                    self.frm.attr('src', vodConfigs.innerPage +urlCache+ '#END');
                    clearTimeout(to);
                }
            }

            return;
            /*for (var i=0; i < len; i += step){
                var sub = tmp.slice(i,i+step);
                console.log('sub:'+i+sub)
                self.frm.attr('src', vodConfigs.innerPage +urlCache+ '#' + sub);
            }*/

        },

        /*
         * 跨域实现异步数据的提交 注意：如果是同域请直接使用 jQuery)
         * POST方式调用如下
         * ajaxPost(url,{key:value},function(json){});
         * 
         */
        ajaxPost:function(url,data){
            // POST 方式提交数据
            // 先动态生成 form 和 input
            var ENTER = "\n";
            var from = '<form id="_ajaxPostFrom_" method="post" action="'+url+'" target="'+ vodConfigs.domPrefix + "ContentFrame" +'">'+ENTER;
            for(var key in data){
                from += '<input type="hidden" name="'+key+'" value="'+encodeURIComponent(data[key])+'" />'+ENTER;
            }
            from += '</form>'+ENTER;
            // 添加到 form
            jQuery(document.body).append(from);
            // 提交表单
            jQuery("#_ajaxPostFrom_")[0].submit();
        },

        onframeLoaded : function (){
            var self = this
            //self.loadingView.hide()
            pageTimes ++;
            if( pageTimes == 1 ){
                //setTimeout(function(){
                    var tmp = self.encode(lxrcAnalyser.strData());
                    console.log('frameLoaded---' + tmp.length)
                    self.getFrame().attr('src',vodConfigs.innerPage +urlCache+ '#' + tmp);
                //},10)
            }
            if(pageTimes == 2 ){
                setTimeout(function(){
                    self.getFrame().attr('src',vodConfigs.innerPage +urlCache+ '#');
                },100)
            }
        },
        getFrame:function(){
            return this.frm || (this.frm = jQuery('#'+ vodConfigs.domPrefix + "ContentFrame"));
        }
	};

    Drag = { 
        obj: null, 
        init: function (options) { 
            options.handler.onmousedown = this.start; 
            options.handler.root = options.root || options.handler; 
            var root = options.handler.root; 
            root.onDragStart = options.dragStart || new Function(); 
            root.onDrag = options.onDrag || new Function(); 
            root.onDragEnd = options.onDragEnd || new Function(); 
        }, 
        start: function (e) {//此时的this是handler 
            var obj = Drag.obj = this; 
            //obj.style.cursor = 'move'; 
            e = e || Drag.fixEvent(window.event); 
            ex = e.pageX; 
            ey = e.pageY; 
            obj.lastMouseX = ex; 
            obj.lastMouseY = ey; 
            var x = obj.root.offsetLeft; 
            var y = obj.root.offsetTop; 
            obj.root.style.left = x + "px"; 
            obj.root.style.top = y + "px"; 
            document.onmouseup = Drag.end; 
            document.onmousemove = Drag.drag; 
            obj.root.onDragStart(x, y); 
        }, 
        drag: function (e) { 
            e = e || Drag.fixEvent(window.event); 
            ex = e.pageX; 
            ey = e.pageY; 
            var root = Drag.obj.root; 
            var x = root.style.left ? parseInt(root.style.left) : 0; 
            var y = root.style.top ? parseInt(root.style.top) : 0; 
            var nx = ex - Drag.obj.lastMouseX + x; 
            var ny = ey - Drag.obj.lastMouseY + y; 
            root.style.left = nx + "px"; 
            root.style.top = ny + "px"; 
            Drag.obj.root.onDrag(nx, ny); 
            Drag.obj.lastMouseX = ex; 
            Drag.obj.lastMouseY = ey; 
            e.preventDefault && e.preventDefault();
        }, 
        end: function (e) { 
            var x = Drag.obj.root.style.left ? parseInt(Drag.obj.root.style.left) : 0; 
            var y = Drag.obj.root.style.top ? parseInt(Drag.obj.root.style.top) : 0; 
            Drag.obj.root.onDragEnd(x, y); 
            document.onmousemove = null; 
            document.onmouseup = null; 
            Drag.obj = null; 
        }, 
        fixEvent: function (e) { 
            e.pageX = e.clientX + document.documentElement.scrollLeft; 
            e.pageY = e.clientY + document.documentElement.scrollTop; 
            return e; 
        } 
    }

	return prototype;

})();