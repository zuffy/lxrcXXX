(function(){var f="http://vod.xunlei.com/page/lxrc";var a="?t=2";var c={showDatas:{},baseSupportFiles:{jq:f+"/js/jquery-1.7.2.js",ui:f+"/js/ui.js",tools:f+"/js/tools.js",analyser:f+"/js/analyser.js",thunder:f+"/js/thunder.js",hashchange:f+"/js/hashchange/jquery.ba-hashchange.js"},prefix:"LXRC_",version:"1.0",hashable:false,originhash:"",loadFlag:(new Date().getTime()),isInit:true,debug:0,charset:document.charset,location:window.location,headLoc:document.getElementsByTagName("head").item(0),bodyLoc:document.getElementsByTagName("body").item(0),supportResourcesType:["video","compact","music"],urlCheckUrl:"http://dynamic.cloud.vip.xunlei.com/interface/get_unionurl_info",statUrl:"http://i.vod.xunlei.com/stat/s.gif?"};if(typeof window.console=="undefined"){window.console={};window.console.log=function(){}}e();function b(){var g=c.baseSupportFiles.hashchange;d(c.baseSupportFiles.analyser,c.charset,function(){d(c.baseSupportFiles.ui,c.charset,function(){d(c.baseSupportFiles.tools,c.charset,function(){jQuery.extend(lxrcTools,c);jQuery.extend(lxrcAnalyser,lxrcTools);jQuery.extend(lxrcUI,lxrcTools);lxrcAnalyser.init(jQuery);lxrcUI.init(jQuery)})})})}function d(h,k,j){var g=document.createElement("script");g.setAttribute("type","text/javascript");var i=("utf8"||"UTF8"||"utf-8"||"UTF-8"||"")?"utf-8":"gbk";g.setAttribute("charset",i);g.setAttribute("src",h+a);document.getElementsByTagName("head").item(0).appendChild(g);if(g.readyState){g.onreadystatechange=function(){if(g.readyState=="loaded"||g.readyState=="complete"){g.onreadystatechange=null;if(typeof(j)=="function"){j()}}}}else{g.onload=function(){if(typeof(j)=="function"){j()}}}}function e(){var g=window.navigator.userAgent.toLowerCase();var h=new RegExp("MSIE (6|7)","i");if(h.test(g)){alert("您的浏览器版本太低，请使用chrome等高级浏览器");return}if(!window.jQuery||typeof(jQuery)=="undefined"||jQuery.fn.jquery<"1.4"){d(c.baseSupportFiles.jq,c.charset,function(){b()})}else{b()}}})();