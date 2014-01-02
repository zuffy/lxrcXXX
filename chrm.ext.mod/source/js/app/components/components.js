define(function(require){
    var $ = require('jquery');
    var BasicTool = require('utils');
	var iScroll = require('iscroll');
    var Event = require('event');
    var ViewEventType = require('event_types');
    ViewEventType = ViewEventType('view');
    
    var myScroll;
    var _lens = 0;
    var _leftNum = 0;
    var _list = [];
    var resWrapper = null;
    var headButtonsWrap = null;
    var  groupSelect= {};
    var headBtnExecuting = 0;
    var lastPick = -1;
    var shiftDown = 0;
    var ctrlDown = 0;
    var keyAction = 1;  //ctrl ,shift key 1:正选，-1:反选标志
    var fixedTipTop = parseFloat( $('#failedTip').css('top') );
    var isRendering = false;

    var ViewManager = function(){
    	this.init();
    }

    ViewManager.prototype = new Event();

    $.extend( ViewManager.prototype, {
    	init : function (){
    		var self = this;
            resWrapper = $('#listddContent');
            headButtonsWrap = $('#listLayer .ybl_box_tit');
            this.clickEventInit();
            this.initSelectOptions();
            this.setHeadButtonsStyle();
            $('<form id="goVodList" action="http://vod.xunlei.com/list.html" target="_blank"><from>').appendTo('body');
            //测试扩展名...
            /*
            var exts = [ 'mkv', 'xv', 'rm', 'mp4', '3gp', 'wmv', 'asf',
                         'vob', 'mov', 'm4v', 'flv', 'ts', 'bt', 'avi',
                         'rmvb', 'mpg', 'mpeg', 'f4v']
            var cur = 0;
            var pc = 'vdadd';
            0 && (function(){
                var sty = 'vd'+exts[cur];
                var call = arguments.callee;
                $('#listddContent i').removeClass(pc).addClass(pc=sty)
                if(cur ++ < exts.length)
                setTimeout(call,103)
            })()
            */
            if( BasicTool.isUA('ie8') ){
                $('#selectAllCkbox').css('margin-top','0px');
                $('.head_buttons .ico').css('padding-top','2px');
            }
            if( BasicTool.isUA('firefox') ){
                //火狐出现虚线框
                $('#selectAllCkbox').css('outline','none');
            }
            
            $(document).keydown(function(e){
                console.log('down')
                shiftDown = (e.keyCode == 16 && e.shiftKey);
                ctrlDown = (e.keyCode == 17 && e.ctrlKey);
            }).keyup(function(){
                shiftDown = false;
                ctrlDown = false;
            })
    	},
        clickEventInit : function(){
            //函数只在开始调用一次;
            var self = this;
            $('#regInBox').unbind("click").click(function(){
                var regUrl = "http://i.xunlei.com/register.html?regfrom=VOD";
                window.open(regUrl, "_blank");
                return false;
            });
            //上下翻转排序;
            $('#upsaidwnBtn').unbind().bind('click',function (){
                self.dispatchEvent(ViewEventType.ReSortDataEvent, {type : '__reverse__'})
            });
            //scroll to top
            $('#scrollTopBtn').unbind().bind('click', function (){
                $('#scrollWrapper')[0].scrollTop = 0;
            });
            //显示更多;
            $('#showMoreBtn').unbind('click').bind( 'click', function(){
                self.dispatchEvent(ViewEventType.ShowMoreEvent)
            });
            //查看vod list;
            $('#myVodListBtn').show().unbind('click').bind( 'click', function(){
                self.dispatchEvent( ViewEventType.ViewMyVodListEvent )
            });

            //屏蔽文本选择;
            $('#scrollWrapper').bind( 'mousedown', function(e){
                $(document).focus();
                if( e.target.id === 'scrollWrapper' ){
                    return false;                
                }
            });

            //列表行内按钮
            $( '#listddContent  li').die( 'mouseenter' ).live( 'mouseenter', function(){
                var theType = $(this).attr('name');
                
                $('#selectAllCkbox').focus().blur();
                var index = parseInt( $(this).attr('oindex') );

                $(this).addClass('on').find('[name=s_vod_play]').die('click').live('click', function(){
                    lastPick = -1;
                    self.dispatchEvent(ViewEventType.SinglePlayEvent, { ids:[index] } );
                }).end().find('[name=s_vod_add]').die('click').live('click', function(){
                    var theType = $(this).closest('li').attr('name');
                    if(theType == 'errorLink')return;
                    if(theType == 'isAdded'){
                        self.dispatchEvent( ViewEventType.ViewMyVodListEvent );
                        return;
                    }
                    lastPick = -1;
                    self.dispatchEvent( ViewEventType.SingleAddEvent, { ids:[index] } );
                });
                if(theType == 'errorLink' || theType == 'isAdded')return;
                $(this).find('[name=s_vod_play]').show().end()
                .find('[name=s_vod_add]').show();

            }).die( 'mouseleave' ).live( 'mouseleave', function(){
                var self = $(this);
                var theType = self.attr('name');
                var notNeed2Show = ( theType == 'isAdded' || theType == 'errorLink' );
                //$(this).find('input:checkbox').blur();
                var chkbox = self.find('input:checked');
                if( !chkbox.attr('checked') )self.removeClass('on');
                if(notNeed2Show)return;
                $(this).find('[name=s_vod_play]').hide();
                $(this).find('[name=s_vod_add]').hide();
            });

            //登录业关闭按钮;
            $('#closeLayerBtn').unbind('click').bind('click', function(){
                $('#loginLayer').hide();
                $('#myVodListBtn').show();
            });

            //全选复选框;
            $('#selectAllCkbox').live('click',function(e){
                var chk = $(this);
                var li = resWrapper.find('li');
                var indexs =[];
                if( chk.attr('checked') ){
                    /*$('#listddContent li:lt(99)')*/
                    li.filter(function(index){
                        var theType = li.eq(index).attr('name')
                        var notNeed2Show = ( theType == 'errorLink' );
                        if( notNeed2Show ) return false;
                        if(typeof groupSelect[index] != 'undefined')groupSelect[index] = false;
                        indexs.push(index);
                        return true;
                    })
                    .addClass('on').find('input:checkbox').attr('checked','checked');
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:1, indexs:indexs });
                } 
                else{
                    li.filter(function(index){
                        var theType = li.eq(index).attr('name');
                        var notNeed2Show = ( theType == 'errorLink' );
                        if( notNeed2Show ) return false;
                        if(typeof groupSelect[index] != 'undefined')groupSelect[index] = false;
                        indexs.push(index);
                        return true;
                    }).removeClass('on').find('input:checkbox').removeAttr('checked');
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:0, indexs:indexs });
                }
                try{
                    chk.html(resWrapper.find('li input:checkbox').size())      
                }catch(e){}

                lastPick = -1;
                self.setHeadButtonsStyle(!0);
            });

            // 点击复选框响应相应事件
            resWrapper.find('li input:checkbox').live('click', function(e){
                var li = $(this).closest('li');
                var theType = li.attr('name');
                if( theType == 'errorLink' ) return false;

                var id = parseInt( li.attr('index') );
                if(typeof groupSelect[id] != 'undefined')groupSelect[id] = false;
                $(document).focus();
                
                if( $(this).attr('checked') ){
                    li.addClass('on');
                    keyAction = 1;
                    $(this).attr('checked','checked');
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:1, indexs:[id] });
                }
                else{
                    li.removeClass('on');  
                    keyAction = -1;
                    $(this).removeAttr('checked');
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:0, indexs:[id] });
                }
                
                if( shiftDown ){
                    self.shiftSelect( lastPick, id );
                }
                //在操作过后更新lastPick;
                lastPick = id;

                self.setHeadButtonsStyle();
            })

            // 点击 每一项 应相应事件
            var lastPosBeforeMouseUp = void(0);
            resWrapper.find('li').live( 'mousedown', function (e){
                var matrix = resWrapper.css('webkit-transform');
                //console.log( 'down:'+  matrix );
                lastPosBeforeMouseUp = matrix;
                /*
                matrix = matrix.replace(/matrix.*\,(.*)\)/, function (a, b){
                    return b;
                })
                */
                return false;
            }).live( 'click', function (e){//[name=resourceName]
                $(document).focus();
                if( resWrapper.css('webkit-transform') != lastPosBeforeMouseUp ){
                    return true;
                }
                //console.log( 'up:'+ resWrapper.css('webkit-transform') );
                var li = $(this);
                var _checkbox = li.find('input:checkbox')
                var theType = li.attr('name');
                var notNeed2Show = ( theType == 'errorLink' );
                var ignore = [ (_checkbox[0] || 0), (li.find('[name=s_vod_play]')[0] || 0), (li.find('[name=s_vod_add]')[0] || 0) ];
                if( BasicTool.inArray(ignore, e.target) || notNeed2Show ) return;

                var id = parseInt( li.attr('index') );
                if(typeof groupSelect[id] != 'undefined')groupSelect[id] = false;
                if(_checkbox.attr('checked')){
                    _checkbox.removeAttr('checked');
                    li.removeClass('on');
                    keyAction = -1;
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:0, indexs:[id] });
                }
                else{
                    _checkbox.attr('checked','checked');
                    li.addClass('on');
                    if( ctrlDown ){

                    }
                    else{
                        self.ctrlSelect( lastPick, id );
                    }
                    keyAction = 1;
                    self.dispatchEvent( ViewEventType.SelectEvent, { on:1, indexs:[id] });
                }
                
                lastPick = id;                
                self.setHeadButtonsStyle();
            });

            headButtonsWrap.find('[name=vod_view_list]').die('click').live('click', function(){
                self.dispatchEvent( ViewEventType.ViewMyVodListEvent );
            });   

            if( BasicTool.isUA('ie8') ){
                $('.ico_ybf').die('mouseenter').live('mouseenter', function(){
                    $(this).css('background-position','right -108px');
                }).die('mouseleave').live('mouseleave', function(){
                    $(this).css('background-position','right -58px');
                })
                $('.ico_add').die('mouseenter').live('mouseenter', function(){
                    $(this).css('background-position','right -133px');
                }).die('mouseleave').live('mouseleave', function(){
                    $(this).css('background-position','right -83px');
                })
                $('.ybl_box_cont li .txt').die('mouseenter').live('mouseenter', function(){
                    $(this).css({'text-decoration':'underline','cursor':'pointer'});
                }).die('mouseleave').live('mouseleave', function(){
                    $(this).css({'text-decoration':'none','cursor':'pointer'});
                })
            }

        },
        ctrlSelect: function( prev ,now ){
            if ( prev <0 || prev == now ) return;
            var li = $('#listddContent li:eq('+ prev +')')
            var _checkbox = li.find('input:checkbox')
            
            if( keyAction > 0 ){
                _checkbox.removeAttr('checked');
                li.removeClass('on');
            }            
        },
        shiftSelect: function( prev ,now ){
            //在点击复选框后，只要按shift键就批量点选，结果为当前复选框的状态;
            if ( prev <0 || prev == now ) return;
            var start = prev > now ? now : prev;
            var end = start == prev ? now : prev;
            var li = $( '#listddContent li');

            var selects =  li.filter(function(index) {
                var theType = li.eq(index).attr('name');
                skip = (theType == 'errorLink');
                var canSel = index >= start && index <=end && !skip;
                if(canSel && (typeof groupSelect[index] != 'undefined'))groupSelect[index] = false;
                return canSel;
            }).find('input:checkbox');
            if( keyAction > 0 ){
                selects.attr('checked','checked');
            }
            else{
                selects.removeAttr('checked');
            }
            //console.log([prev,now,keyAction])
            //console.log( selects );
            return ;

        },
        initSelectOptions : function(){
            var str = '<option value="">默认排序</option>';
            var select = $('#listLayer .ybl_box_tit select');
            var self = this;
            var sortOption = {
                    name : '文件名',
                    filesize : '文件大小'
                }
            for ( var k in sortOption ){
                str +='<option value="'+ k +'">'+ sortOption[k] +'</option>';
            }
            select.html(str).unbind('change').bind('change',function(){
                //console.log(this.value)
                self.dispatchEvent( ViewEventType.ReSortDataEvent, {type : this.value} );
            })
        },
        /** 设置顶栏按钮样式（可点、不可点） */
        setHeadButtonsStyle : function( keepAllSelectState ){
            if( headBtnExecuting ) return;
            var self = this;
            var resourcesListWrap = resWrapper;
            var selected = resourcesListWrap.find('li input:checkbox[checked]');
            var selectedNum = selected.length;
            var playBtn = headButtonsWrap.find('[name=vod_play]').unbind('click');
            var addBtn = headButtonsWrap.find('[name=vod_add]').unbind('click');
            var downlBtn = headButtonsWrap.find('[name=vod_down]').unbind('click');
            var exec = function(evt){
                if( headBtnExecuting ) return;
                var i, item
                ,   tmp = []
                ,   inps = resourcesListWrap.find('li input') //获取实时的项
                ,   len = inps.length;
                for( i = 0; i < len; i++ ){
                    item = inps.eq(i);
                    if( item.attr('checked') ){
                        var id = parseInt( item.attr('oindex') );
                        tmp.push( id );
                        groupSelect[id] = true;
                    }                    
                }
                if(tmp.length == 0)return;
                lastPick = -1;
                self.dispatchEvent( evt, { ids:tmp });
            }
            
            self.showSelNums( selectedNum );
            if( selectedNum > 99 ){
                playBtn.addClass('btn_ybf_gray').removeClass('btn_ybf');
                addBtn.addClass('btn_add_gray').removeClass('btn_add');
                downlBtn.addClass('btn_dl_gray').removeClass('btn_dl');
                return;
            }
            else if( selectedNum > 0 ){
                playBtn.removeClass('btn_ybf_gray').addClass('btn_ybf');
                addBtn.removeClass('btn_add_gray').addClass('btn_add');
                downlBtn.removeClass('btn_dl_gray').addClass('btn_dl');
                playBtn.bind('click', function(){
                    exec( ViewEventType.VodPlayBtnClickEvent );
                })
                addBtn.bind('click', function(){
                    exec( ViewEventType.VodAddBtnClickEvent );
                });

                downlBtn.bind('click',function(){
                    if( headBtnExecuting ) return;
                    var i, item
                    ,   tmp = []
                    ,   inps = resourcesListWrap.find('li input') //获取实时的项
                    ,   len = inps.length;
                    for( i = 0; i < len; i++ ){
                        item = inps.eq(i);
                        if( item.attr('checked') ){
                            var id = parseInt( item.attr('oindex') );
                            tmp.push(id);
                        }
                    }
                    if(tmp.length == 0)return;
                    lastPick = -1;
                    self.dispatchEvent( ViewEventType.VodDownLoadBtnClickEvent, { ids:tmp });
                })

                if( selectedNum != _lens ){
                    !keepAllSelectState && $('#selectAllCkbox').removeAttr('checked');
                }
                else{
                    !keepAllSelectState && $('#selectAllCkbox').attr('checked','checked');  
                }
            }else{
                playBtn.addClass('btn_ybf_gray').removeClass('btn_ybf');
                addBtn.addClass('btn_add_gray').removeClass('btn_add');
                downlBtn.addClass('btn_dl_gray').removeClass('btn_dl');
                !keepAllSelectState && $('#selectAllCkbox').removeAttr('checked');
            }
            self.listBtnStatus();            
        },
		renderPage : function( lists, leftNums, updateMoreButton ){
            var self = this;
			_list = lists;
			_lens = lists.length ;
			_leftNum = leftNums;
			
            _lens ? (function(){
                        if(isRendering)return;
                        //var t = new Date().getTime();
                        self.renderList();
                        //t = new Date().getTime() - t;
                        //console.log('used time :' + t);
                        typeof updateMoreButton !='undefined' && self.toggleMoreBtn(updateMoreButton);
                    })() : self.notFound();
		},
		notFound : function(){
            $('#tipsLayer').show();
            $('#tipsLayer').find('[name="loading"]').hide();
            $('#tipsLayer').find('[name="notFound"]').show();
		},		
		prepareScroll : function( ){
			var self = this;
            $('#scrollTopBtn').hide();
			if( _lens < 9) return;
            $('#scrollTopBtn').show();
            /*
            (typeof myScroll == "undefined") && 
            (myScroll = new iScroll(scrollWrapper, {
				onRefresh: function () {},
				onScrollMove: function () {},
				onScrollEnd: function () {}
			}));
            myScroll.refresh();
            */
		},
    	renderList : function(){
			var i = 0
			,	self = this
            ,   size = 0
            ,   indexs = []
            ,	contentStr = '<ul class="ybl_box_cont">'
            ,   allSelected = !!$('#selectAllCkbox').attr('checked')
			,   selected
            ,   style = ''

            if( BasicTool.isUA('ie8') ){
                style = 'style="height:29px;padding:9px 0" ';
            }

			isRendering = true;
            //var t = new Date().getTime();
			for( i = 0; i < _lens ; i ++ ){
                size = parseInt( _list[i].filesize * 10/1024/1024 )/10
                size = size > 1000 ? ( (size/100)>>0 )/10 +"G" : (!!size ? size + "M" : '--' );
                //渲染方式
                //正常模式
                if(_list[i].isAdded){
                    contentStr +=
                    '<li index="'+ i +'" oindex="'+ _list[i].oindex +'" name="isAdded" class="ddAdded" '+ style +'>\
                        <input index="'+ i +'" oindex="'+ _list[i].oindex +'" type="checkbox" '+ ( (groupSelect[ _list[i].oindex ] || allSelected) ?'checked':'') +'>\
                        <i class="vdtype '+ _list[i].ext.toLocaleLowerCase() +'" name="icon"></i>\
                        <a class="txt" name="resourceName" title="'+ _list[i].name +'">'+ _list[i].shortName +'</a>\
                        <span name="size" class="size">'+ size +'</span>\
                        <a class="ico ico_ybf" name="s_vod_play" title="云播放">云播放</a>\
                        <a class="ico ico_added" name="s_vod_add" title="查看列表">查看列表</a>\
                    </li>'
                }
                //链接出错..
                else if(!_list[i].inited){
                    contentStr +=
                    '<li index="'+ i +'" oindex="'+ _list[i].oindex +'" name="errorLink" '+ style +'>\
                        <input index="'+ i +'" oindex="'+ _list[i].oindex +'" type="checkbox">\
                        <i class="vdtype vdadd" name="icon"></i>\
                        <a class="txt" name="resourceName" title="'+ _list[i].name +'">'+ _list[i].shortName +'</a>\
                        <span class="errorLink" style="color:red;position:relative;display:inline-block;height:28px;">!链接有误</span>\
                    </li>';
                }
                //正常模式
                else{
                    if( !_list[i].selected && allSelected ){
                        indexs.push(i)            
                    }
                    selected = _list[i].selected || allSelected;
                    contentStr +=
                    '<li index="'+ i +'" oindex="'+ _list[i].oindex +'" name="normal" class="'+ ( selected ? 'on' : '') +'" '+ style +'>\
                        <input index="'+ i +'" oindex="'+ _list[i].oindex +'" type="checkbox"'+ ( selected ? 'checked' : '') +'>\
                        <i class="vdtype '+ _list[i].ext.toLocaleLowerCase() +'" name="icon"></i>\
                        <a class="txt" name="resourceName" title="'+ _list[i].name +'">'+ _list[i].shortName +'</a>\
                        <span name="size" class="size">'+ size +'</span>\
                        <a class="ico ico_ybf" name="s_vod_play" title="云播放" style="display:none;">云播放</a>\
                        <a class="ico ico_add" name="s_vod_add" title="加入列表" style="display:none;">加入列表</a>\
                    </li>';
                }
                //全选状态下，more时候把不用步数据更新.
                if( indexs.length > 0 )
                self.dispatchEvent( ViewEventType.SelectEvent, { on:1, indexs:indexs });
			}

            //t = new Date().getTime() - t;
            //console.log('looped time :' + t);
			contentStr +="</ul>"
            $('#listLayer').show();
            $('#tipsLayer').hide();
            $('#tipsLayer').find('[name=notFound]').hide();
            
            //t = new Date().getTime();
            resWrapper[0].innerHTML = contentStr;
            resWrapper.show();
            //t = new Date().getTime() - t;
            //console.log('renderContent time :' + t);
            
            //t = new Date().getTime();
            self.prepareScroll();
            self.setHeadButtonsStyle(!0);
            
            
            $('#showMore span').text(_leftNum + '/' + (_lens+_leftNum) );   
            $('#showMore').mousedown(function(){return false;});
            $('#listLayer .ybl_box_tit').mousedown(function(e){ 
                $(document).focus();
                if (e.target.className.toLowerCase() == 'ybl_box_tit') {
                    return false;
                };
            });
            //t = new Date().getTime() - t;
            //console.log('renderOther time :' + t);
            isRendering = false;
            
		},
        showSelNums: function( num ) {
            var text = '已勾选'+ num +'个/'+ (_lens + _leftNum) +'个'
            if( parseInt(num) > 99 ){
                text = '已超出99个，请先取消多选的任务';
                $('#selTip').text(text).css('color','red').show();
            }
            else if( parseInt(num) > 0){

                $('#selTip').text(text).css('color','black').show();
            }
            else{
                $('#selTip').hide();
            }

        },
		toggleMoreBtn : function( isShow ){
			//isShow ? $('#showMore').show() : $('#showMore').hide();
            this.setHeadButtonsStyle();
            this.showSelNums ( resWrapper.find('li input:checkbox[checked]').length );
            !isShow && $('#showMore').text('已全部显示'+ _lens +'个资源');
		},
        listBtnStatus : function ( state ){
            headBtnExecuting = 0;
            switch ( state ){
                case 'loading':
                    headButtonsWrap.find('[name=vod_add]').hide();
                    headButtonsWrap.find('[name=vod_adding]').show();
                    headButtonsWrap.find('[name=vod_view_list]').hide();
                    headBtnExecuting = 1;
                    break;
                case 'added':
                    headButtonsWrap.find('[name=vod_add]').hide();
                    headButtonsWrap.find('[name=vod_adding]').hide();
                    headButtonsWrap.find('[name=vod_view_list]').show();
                    break;
                case 'error':
                    var callee = arguments.callee;
                    var tip = $('#failedTip');
                    tip.css({ 'top': ( fixedTipTop + 20 ) + 'px', 'opacity':'0.25' }).show();
                    tip.animate( {
                        top : fixedTipTop,
                        opacity: 1
                    }, 550, function(){
                        var self = $(this);
                        setTimeout(function(){
                            self.hide();
                            callee()
                        }, 1e3);
                    })
                    headBtnExecuting = 1;
                case 'normal' :
                default :
                    headButtonsWrap.find('[name=vod_add]').show();
                    headButtonsWrap.find('[name=vod_adding]').hide();
                    headButtonsWrap.find('[name=vod_view_list]').hide();
                    break;
            }
        },
        updateItem : function ( index, datas, retry ){
            var li = $('#listddContent').find('[oindex='+ index +']');
            var callee = arguments.callee;
            var self = this;
            if( retry > 1)return;
            if( li.size() < 1){
                //页面如果没有渲染完毕延时执行
                console.log('find index:'+index+"at retry:"+retry)
                setTimeout(function(){
                    retry = retry || 0;
                    callee.call(self, index, datas, retry+1);
                },1000);
                return;
            }

            var id = li.attr('index');
            var size = parseInt(datas.filesize*10/1024/1024)/10 ;
            size = size > 1000 ? ( (size/100)>>0 )/10 +"G" : (!!size ? size + "M" : '--' );
            var html;
            if(datas.isAdded){
                html = '<input index="'+ id +'" oindex="'+ datas.oindex +'" type="checkbox" '+ (groupSelect[datas.oindex]||datas.selected? 'checked':'') +'>\
                <i class="vdtype '+ datas.ext.toLocaleLowerCase() +'" name="icon"></i>\
                <a class="txt" name="resourceName" title="'+ datas.name +'">'+ datas.shortName +'</a>\
                <span name="size" class="size">'+ size +'</span>\
                <a class="ico ico_ybf" name="s_vod_play" title="云播放">云播放</a>\
                <a class="ico ico_added" name="s_vod_add" title="查看列表">查看列表</a>';
                li.addClass('ddAdded').attr('name','isAdded');
            }
            else if(!datas.inited){
               html = '<input index="'+ id +'" type="checkbox">\
                        <i class="vdtype vdadd" name="icon"></i>\
                        <a class="txt" name="resourceName" title="'+ datas.name +'">'+ datas.shortName +'</a>\
                        <span class="errorLink" style="color:red;position:relative;display:inline-block;height:28px;">!链接有误</span>';
                li.attr('name','errorLink');
            }
            else{
                html = '<input index="'+ id +'" oindex="'+ datas.oindex +'" type="checkbox"'+ (datas.selected ? 'checked' : '') +'>\
                <i class="vdtype '+ datas.ext.toLocaleLowerCase() +'" name="icon"></i>\
                <a class="txt" name="resourceName" title="'+ datas.name +'">'+ datas.shortName +'</a>\
                <span name="size" class="size">'+ size +'</span>\
                <a class="ico ico_ybf" name="s_vod_play" title="云播放" style="display:none;">云播放</a>\
                <a class="ico ico_add" name="s_vod_add" title="加入列表" style="display:none;">加入列表</a>';
                li.attr('name','normal');
            }
            li[0].innerHTML = html;
        }       
        

    })
    return ViewManager ;
})