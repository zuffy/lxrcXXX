(function(){
		
	var gServerUrl = 'http://vod.xunlei.com/page/lxrc';
	//var noCache = '?t='+(new Date().getTime());
	var noCache = '?t=2';
	
	var config = {
		showDatas:{},//用于显示的数据
		baseSupportFiles : {
			jq : gServerUrl+'/js/jquery-1.7.2.js',
			ui : gServerUrl+'/js/ui.js',
			tools : gServerUrl+'/js/tools.js',
			analyser : gServerUrl+'/js/analyser.js',
			thunder : gServerUrl+'/js/thunder.js',
			hashchange:gServerUrl+'/js/hashchange/jquery.ba-hashchange.js'
		},
		prefix : 'LXRC_',
		version : '1.0',
		hashable:false,
		originhash:'',
		loadFlag : (new Date().getTime()),
		isInit : true,	// 是第一次执行
		debug : 0,
		charset : document.charset,
		location : window.location,
		headLoc : document.getElementsByTagName("head").item(0),
		bodyLoc : document.getElementsByTagName("body").item(0),
		supportResourcesType : ['video',/*'image',*/'compact','music'],	// 支持的资源类型，产品上的定义
		urlCheckUrl : 'http://dynamic.cloud.vip.xunlei.com/interface/get_unionurl_info',
		statUrl : 'http://i.vod.xunlei.com/stat/s.gif?'
	};
	
	if(typeof window.console == 'undefined'){
		window.console = {};
		window.console.log = function(){};
	}

	run();
	
	function loadBaseSupportFiles (){
		//console.log('loadBaseSupportFiles');
		var hashChgUrl = config.baseSupportFiles.hashchange ;
		
		//gGetScript(hashChgUrl,config.charset,function(){
			
			gGetScript(config.baseSupportFiles.analyser,config.charset,function(){
			
				gGetScript(config.baseSupportFiles.ui,config.charset,function(){
					
					gGetScript(config.baseSupportFiles.tools,config.charset,function(){
						//gGetScript(config.baseSupportFiles.thunder,config.charset);	// 加载thunder	
						jQuery.extend(lxrcTools,config);	// 继承config
						jQuery.extend(lxrcAnalyser,lxrcTools);
						jQuery.extend(lxrcUI,lxrcTools);
						//if(!navigator.userAgent.match(/(MSIE|Firefox)/)){
						lxrcAnalyser.init(jQuery);	// 开始抓取数据
			            //}
						lxrcUI.init(jQuery);	// 生成自己的dom
					});
				});
			});
		//});
	};
	

	/** 该方法主要用于无jQuery的情况时加载jQuery文件 
	*	@	param	url 		要进行加载的脚本文件地址
	*	@	param	charset 	指定加载脚本的编码类型，默认是utf-8
	*	@	param	callback	加载完成回调的方法,可选参数
	*/
	function gGetScript(url,charset,callback){
		var scriptObj = document.createElement('script');
		scriptObj.setAttribute('type','text/javascript');
		var _charset = ('utf8'||'UTF8'||'utf-8'||'UTF-8'||'') ? 'utf-8': 'gbk';
		scriptObj.setAttribute('charset',_charset);
		scriptObj.setAttribute('src',url+noCache);
		document.getElementsByTagName('head').item(0).appendChild(scriptObj);
		if(scriptObj.readyState){	// for IE
			scriptObj.onreadystatechange = function(){
				if (scriptObj.readyState == "loaded" || scriptObj.readyState == "complete"){
					scriptObj.onreadystatechange = null;
					if(typeof(callback)=='function'){
						callback();
					}
				}
			}
		}else{
			scriptObj.onload = function(){
				if( typeof(callback)=='function' )
					callback();
			}
		}
	};

	function run(){
		var ua = window.navigator.userAgent.toLowerCase();
		var exp =  new RegExp('MSIE (6|7)','i');
		if( exp.test(ua) ){
			alert("您的浏览器版本太低，请使用chrome等高级浏览器");
			return;
		}

		// 加载jq
		if( !window.jQuery || typeof(jQuery) =='undefined' || jQuery.fn.jquery<'1.4' ){
			gGetScript( config.baseSupportFiles.jq,config.charset,function(){
				loadBaseSupportFiles();
			});
		}else{
			loadBaseSupportFiles();
		}
	};
})();