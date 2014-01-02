define("app/components/1.0.0/components",["gallery/jquery/1.0.0/jquery","common/utils/1.0.0/utils","common/iscroll/1.0.0/iscroll","common/event/1.0.0/event","common/event_types/1.0.0/event_types"],function(a){var b=a("gallery/jquery/1.0.0/jquery"),c=a("common/utils/1.0.0/utils");a("common/iscroll/1.0.0/iscroll");var e=a("common/event/1.0.0/event"),f=a("common/event_types/1.0.0/event_types");f=f("view");var h=0,i=0,j=[],k=null,l=null,m={},n=0,o=-1,p=0,q=0,r=1,s=parseFloat(b("#failedTip").css("top")),t=!1,u=function(){this.init()};return u.prototype=new e,b.extend(u.prototype,{init:function(){k=b("#listddContent"),l=b("#listLayer .ybl_box_tit"),this.clickEventInit(),this.initSelectOptions(),this.setHeadButtonsStyle(),b('<form id="goVodList" action="http://vod.xunlei.com/list.html" target="_blank"><from>').appendTo("body"),c.isUA("ie8")&&(b("#selectAllCkbox").css("margin-top","0px"),b(".head_buttons .ico").css("padding-top","2px")),c.isUA("firefox")&&b("#selectAllCkbox").css("outline","none"),b(document).keydown(function(a){console.log("down"),p=16==a.keyCode&&a.shiftKey,q=17==a.keyCode&&a.ctrlKey}).keyup(function(){p=!1,q=!1})},clickEventInit:function(){var a=this;b("#regInBox").unbind("click").click(function(){var a="http://i.xunlei.com/register.html?regfrom=VOD";return window.open(a,"_blank"),!1}),b("#upsaidwnBtn").unbind().bind("click",function(){a.dispatchEvent(f.ReSortDataEvent,{type:"__reverse__"})}),b("#scrollTopBtn").unbind().bind("click",function(){b("#scrollWrapper")[0].scrollTop=0}),b("#showMoreBtn").unbind("click").bind("click",function(){a.dispatchEvent(f.ShowMoreEvent)}),b("#myVodListBtn").show().unbind("click").bind("click",function(){a.dispatchEvent(f.ViewMyVodListEvent)}),b("#scrollWrapper").bind("mousedown",function(a){return b(document).focus(),"scrollWrapper"===a.target.id?!1:void 0}),b("#listddContent  li").die("mouseenter").live("mouseenter",function(){var c=b(this).attr("name");b("#selectAllCkbox").focus().blur();var d=parseInt(b(this).attr("oindex"));b(this).addClass("on").find("[name=s_vod_play]").die("click").live("click",function(){o=-1,a.dispatchEvent(f.SinglePlayEvent,{ids:[d]})}).end().find("[name=s_vod_add]").die("click").live("click",function(){var c=b(this).closest("li").attr("name");if("errorLink"!=c){if("isAdded"==c)return a.dispatchEvent(f.ViewMyVodListEvent),void 0;o=-1,a.dispatchEvent(f.SingleAddEvent,{ids:[d]})}}),"errorLink"!=c&&"isAdded"!=c&&b(this).find("[name=s_vod_play]").show().end().find("[name=s_vod_add]").show()}).die("mouseleave").live("mouseleave",function(){var a=b(this),c=a.attr("name"),d="isAdded"==c||"errorLink"==c,e=a.find("input:checked");e.attr("checked")||a.removeClass("on"),d||(b(this).find("[name=s_vod_play]").hide(),b(this).find("[name=s_vod_add]").hide())}),b("#closeLayerBtn").unbind("click").bind("click",function(){b("#loginLayer").hide(),b("#myVodListBtn").show()}),b("#selectAllCkbox").live("click",function(){var d=b(this),e=k.find("li"),g=[];d.attr("checked")?(e.filter(function(a){var b=e.eq(a).attr("name"),c="errorLink"==b;return c?!1:("undefined"!=typeof m[a]&&(m[a]=!1),g.push(a),!0)}).addClass("on").find("input:checkbox").attr("checked","checked"),a.dispatchEvent(f.SelectEvent,{on:1,indexs:g})):(e.filter(function(a){var b=e.eq(a).attr("name"),c="errorLink"==b;return c?!1:("undefined"!=typeof m[a]&&(m[a]=!1),g.push(a),!0)}).removeClass("on").find("input:checkbox").removeAttr("checked"),a.dispatchEvent(f.SelectEvent,{on:0,indexs:g}));try{d.html(k.find("li input:checkbox").size())}catch(c){}o=-1,a.setHeadButtonsStyle(!0)}),k.find("li input:checkbox").live("click",function(){var d=b(this).closest("li"),e=d.attr("name");if("errorLink"==e)return!1;var g=parseInt(d.attr("index"));"undefined"!=typeof m[g]&&(m[g]=!1),b(document).focus(),b(this).attr("checked")?(d.addClass("on"),r=1,b(this).attr("checked","checked"),a.dispatchEvent(f.SelectEvent,{on:1,indexs:[g]})):(d.removeClass("on"),r=-1,b(this).removeAttr("checked"),a.dispatchEvent(f.SelectEvent,{on:0,indexs:[g]})),p&&a.shiftSelect(o,g),o=g,a.setHeadButtonsStyle()});var d=void 0;k.find("li").live("mousedown",function(){var b=k.css("webkit-transform");return d=b,!1}).live("click",function(e){if(b(document).focus(),k.css("webkit-transform")!=d)return!0;var g=b(this),h=g.find("input:checkbox"),i=g.attr("name"),j="errorLink"==i,l=[h[0]||0,g.find("[name=s_vod_play]")[0]||0,g.find("[name=s_vod_add]")[0]||0];if(!c.inArray(l,e.target)&&!j){var n=parseInt(g.attr("index"));"undefined"!=typeof m[n]&&(m[n]=!1),h.attr("checked")?(h.removeAttr("checked"),g.removeClass("on"),r=-1,a.dispatchEvent(f.SelectEvent,{on:0,indexs:[n]})):(h.attr("checked","checked"),g.addClass("on"),q||a.ctrlSelect(o,n),r=1,a.dispatchEvent(f.SelectEvent,{on:1,indexs:[n]})),o=n,a.setHeadButtonsStyle()}}),l.find("[name=vod_view_list]").die("click").live("click",function(){a.dispatchEvent(f.ViewMyVodListEvent)}),c.isUA("ie8")&&(b(".ico_ybf").die("mouseenter").live("mouseenter",function(){b(this).css("background-position","right -108px")}).die("mouseleave").live("mouseleave",function(){b(this).css("background-position","right -58px")}),b(".ico_add").die("mouseenter").live("mouseenter",function(){b(this).css("background-position","right -133px")}).die("mouseleave").live("mouseleave",function(){b(this).css("background-position","right -83px")}),b(".ybl_box_cont li .txt").die("mouseenter").live("mouseenter",function(){b(this).css({"text-decoration":"underline",cursor:"pointer"})}).die("mouseleave").live("mouseleave",function(){b(this).css({"text-decoration":"none",cursor:"pointer"})}))},ctrlSelect:function(a,c){if(!(0>a||a==c)){var d=b("#listddContent li:eq("+a+")"),e=d.find("input:checkbox");r>0&&(e.removeAttr("checked"),d.removeClass("on"))}},shiftSelect:function(a,c){if(!(0>a||a==c)){var d=a>c?c:a,e=d==a?c:a,f=b("#listddContent li"),g=f.filter(function(a){var b=f.eq(a).attr("name");skip="errorLink"==b;var c=a>=d&&e>=a&&!skip;return c&&"undefined"!=typeof m[a]&&(m[a]=!1),c}).find("input:checkbox");r>0?g.attr("checked","checked"):g.removeAttr("checked")}},initSelectOptions:function(){var a='<option value="">默认排序</option>',c=b("#listLayer .ybl_box_tit select"),d=this,e={name:"文件名",filesize:"文件大小"};for(var g in e)a+='<option value="'+g+'">'+e[g]+"</option>";c.html(a).unbind("change").bind("change",function(){d.dispatchEvent(f.ReSortDataEvent,{type:this.value})})},setHeadButtonsStyle:function(a){if(!n){var c=this,d=k,e=d.find("li input:checkbox[checked]"),g=e.length,i=l.find("[name=vod_play]").unbind("click"),j=l.find("[name=vod_add]").unbind("click"),p=l.find("[name=vod_down]").unbind("click"),q=function(a){if(!n){var b,e,f=[],g=d.find("li input"),h=g.length;for(b=0;h>b;b++)if(e=g.eq(b),e.attr("checked")){var i=parseInt(e.attr("oindex"));f.push(i),m[i]=!0}0!=f.length&&(o=-1,c.dispatchEvent(a,{ids:f}))}};if(c.showSelNums(g),g>99)return i.addClass("btn_ybf_gray").removeClass("btn_ybf"),j.addClass("btn_add_gray").removeClass("btn_add"),p.addClass("btn_dl_gray").removeClass("btn_dl"),void 0;g>0?(i.removeClass("btn_ybf_gray").addClass("btn_ybf"),j.removeClass("btn_add_gray").addClass("btn_add"),p.removeClass("btn_dl_gray").addClass("btn_dl"),i.bind("click",function(){q(f.VodPlayBtnClickEvent)}),j.bind("click",function(){q(f.VodAddBtnClickEvent)}),p.bind("click",function(){if(!n){var a,b,e=[],g=d.find("li input"),h=g.length;for(a=0;h>a;a++)if(b=g.eq(a),b.attr("checked")){var i=parseInt(b.attr("oindex"));e.push(i)}0!=e.length&&(o=-1,c.dispatchEvent(f.VodDownLoadBtnClickEvent,{ids:e}))}}),g!=h?!a&&b("#selectAllCkbox").removeAttr("checked"):!a&&b("#selectAllCkbox").attr("checked","checked")):(i.addClass("btn_ybf_gray").removeClass("btn_ybf"),j.addClass("btn_add_gray").removeClass("btn_add"),p.addClass("btn_dl_gray").removeClass("btn_dl"),!a&&b("#selectAllCkbox").removeAttr("checked")),c.listBtnStatus()}},renderPage:function(a,b,c){var d=this;j=a,h=a.length,i=b,h?function(){t||(d.renderList(),"undefined"!=typeof c&&d.toggleMoreBtn(c))}():d.notFound()},notFound:function(){b("#tipsLayer").show(),b("#tipsLayer").find('[name="loading"]').hide(),b("#tipsLayer").find('[name="notFound"]').show()},prepareScroll:function(){b("#scrollTopBtn").hide(),9>h||b("#scrollTopBtn").show()},renderList:function(){var o,a=0,d=this,e=0,g=[],l='<ul class="ybl_box_cont">',n=!!b("#selectAllCkbox").attr("checked"),p="";for(c.isUA("ie8")&&(p='style="height:29px;padding:9px 0" '),t=!0,a=0;h>a;a++)e=parseInt(10*j[a].filesize/1024/1024)/10,e=e>1e3?(e/100>>0)/10+"G":e?e+"M":"--",j[a].isAdded?l+='<li index="'+a+'" oindex="'+j[a].oindex+'" name="isAdded" class="ddAdded" '+p+'>                        <input index="'+a+'" oindex="'+j[a].oindex+'" type="checkbox" '+(m[j[a].oindex]||n?"checked":"")+'>                        <i class="vdtype '+j[a].ext.toLocaleLowerCase()+'" name="icon"></i>                        <a class="txt" name="resourceName" title="'+j[a].name+'">'+j[a].shortName+'</a>                        <span name="size" class="size">'+e+'</span>                        <a class="ico ico_ybf" name="s_vod_play" title="云播放">云播放</a>                        <a class="ico ico_added" name="s_vod_add" title="查看列表">查看列表</a>                    </li>':j[a].inited?(!j[a].selected&&n&&g.push(a),o=j[a].selected||n,l+='<li index="'+a+'" oindex="'+j[a].oindex+'" name="normal" class="'+(o?"on":"")+'" '+p+'>                        <input index="'+a+'" oindex="'+j[a].oindex+'" type="checkbox"'+(o?"checked":"")+'>                        <i class="vdtype '+j[a].ext.toLocaleLowerCase()+'" name="icon"></i>                        <a class="txt" name="resourceName" title="'+j[a].name+'">'+j[a].shortName+'</a>                        <span name="size" class="size">'+e+'</span>                        <a class="ico ico_ybf" name="s_vod_play" title="云播放" style="display:none;">云播放</a>                        <a class="ico ico_add" name="s_vod_add" title="加入列表" style="display:none;">加入列表</a>                    </li>'):l+='<li index="'+a+'" oindex="'+j[a].oindex+'" name="errorLink" '+p+'>                        <input index="'+a+'" oindex="'+j[a].oindex+'" type="checkbox">                        <i class="vdtype vdadd" name="icon"></i>                        <a class="txt" name="resourceName" title="'+j[a].name+'">'+j[a].shortName+'</a>                        <span class="errorLink" style="color:red;position:relative;display:inline-block;height:28px;">!链接有误</span>                    </li>',g.length>0&&d.dispatchEvent(f.SelectEvent,{on:1,indexs:g});l+="</ul>",b("#listLayer").show(),b("#tipsLayer").hide(),b("#tipsLayer").find("[name=notFound]").hide(),k[0].innerHTML=l,k.show(),d.prepareScroll(),d.setHeadButtonsStyle(!0),b("#showMore span").text(i+"/"+(h+i)),b("#showMore").mousedown(function(){return!1}),b("#listLayer .ybl_box_tit").mousedown(function(a){return b(document).focus(),"ybl_box_tit"==a.target.className.toLowerCase()?!1:void 0}),t=!1},showSelNums:function(a){var c="已勾选"+a+"个/"+(h+i)+"个";parseInt(a)>99?(c="已超出99个，请先取消多选的任务",b("#selTip").text(c).css("color","red").show()):parseInt(a)>0?b("#selTip").text(c).css("color","black").show():b("#selTip").hide()},toggleMoreBtn:function(a){this.setHeadButtonsStyle(),this.showSelNums(k.find("li input:checkbox[checked]").length),!a&&b("#showMore").text("已全部显示"+h+"个资源")},listBtnStatus:function(a){switch(n=0,a){case"loading":l.find("[name=vod_add]").hide(),l.find("[name=vod_adding]").show(),l.find("[name=vod_view_list]").hide(),n=1;break;case"added":l.find("[name=vod_add]").hide(),l.find("[name=vod_adding]").hide(),l.find("[name=vod_view_list]").show();break;case"error":var c=arguments.callee,d=b("#failedTip");d.css({top:s+20+"px",opacity:"0.25"}).show(),d.animate({top:s,opacity:1},550,function(){var a=b(this);setTimeout(function(){a.hide(),c()},1e3)}),n=1;case"normal":default:l.find("[name=vod_add]").show(),l.find("[name=vod_adding]").hide(),l.find("[name=vod_view_list]").hide()}},updateItem:function(a,c,d){var e=b("#listddContent").find("[oindex="+a+"]"),f=arguments.callee,g=this;if(!(d>1)){if(1>e.size())return console.log("find index:"+a+"at retry:"+d),setTimeout(function(){d=d||0,f.call(g,a,c,d+1)},1e3),void 0;var h=e.attr("index"),i=parseInt(10*c.filesize/1024/1024)/10;i=i>1e3?(i/100>>0)/10+"G":i?i+"M":"--";var j;c.isAdded?(j='<input index="'+h+'" oindex="'+c.oindex+'" type="checkbox" '+(m[c.oindex]||c.selected?"checked":"")+'>                <i class="vdtype '+c.ext.toLocaleLowerCase()+'" name="icon"></i>                <a class="txt" name="resourceName" title="'+c.name+'">'+c.shortName+'</a>                <span name="size" class="size">'+i+'</span>                <a class="ico ico_ybf" name="s_vod_play" title="云播放">云播放</a>                <a class="ico ico_added" name="s_vod_add" title="查看列表">查看列表</a>',e.addClass("ddAdded").attr("name","isAdded")):c.inited?(j='<input index="'+h+'" oindex="'+c.oindex+'" type="checkbox"'+(c.selected?"checked":"")+'>                <i class="vdtype '+c.ext.toLocaleLowerCase()+'" name="icon"></i>                <a class="txt" name="resourceName" title="'+c.name+'">'+c.shortName+'</a>                <span name="size" class="size">'+i+'</span>                <a class="ico ico_ybf" name="s_vod_play" title="云播放" style="display:none;">云播放</a>                <a class="ico ico_add" name="s_vod_add" title="加入列表" style="display:none;">加入列表</a>',e.attr("name","normal")):(j='<input index="'+h+'" type="checkbox">                        <i class="vdtype vdadd" name="icon"></i>                        <a class="txt" name="resourceName" title="'+c.name+'">'+c.shortName+'</a>                        <span class="errorLink" style="color:red;position:relative;display:inline-block;height:28px;">!链接有误</span>',e.attr("name","errorLink")),e[0].innerHTML=j}}}),u});