define(function(require) {
	var JSON = require('json');
	var $ = require('jquery');
	var BasicTools = require('utils');
	var PageView = require('components');
	var DataManager = require('modules');
	var LoginMod = require('login');
	var Event = require('event');
	var EventTypes = require('event_types');
	var DataEventType = EventTypes('data');
	var ViewEventType = EventTypes('view');
	var pageView = null;
	var loginMod = null;
	var from = 'browseraddin_360';
	var vodListUrl = 'http://vod.xunlei.com/list.html';
	var PageManager = function(){
		this.init();
	}
	PageManager.prototype = new Event();
	$.extend( PageManager.prototype,{
		init : function(){
			/*		$('#dis').text( BasicTools.decode(data.lists) );		*/
 			pageView = new PageView()
			this.addEventListeners();
			this.ShowMoreHandler( 'init' );
			this.loginInits();
		},
		addEventListeners : function(){
			var self = this;
			
			//from view events
			//显示更多...
			pageView.addEventListener( ViewEventType.ShowMoreEvent, function(){
				self.ShowMoreHandler();
			});
			//查看云列表
			pageView.addEventListener( ViewEventType.ViewMyVodListEvent, function(){
				//console.log(document.domain,document.cookie);
				if(!BasicTools.isLogin()){
					self.loginInits(function(){
						$('#loginLayer').hide();
						$('#myVodListBtn').show();
					});
					$('#loginLayer').fadeIn(200);
					if( BasicTools.isUA('ie8') ){
						$('#loginLayer').css('background','#fff');
						$('#myVodListBtn').hide();
					}
					return false;
				}
				//console.log(document.domain,document.cookie);
				try{
					//$('#goVodList')[0].submit();
					window.open( vodListUrl, '_blank' );
				}
				catch(e){window.open( vodListUrl, '_blank' );}
				//console.log(document.domain,document.cookie);
			});
			//批量添加到云列表按钮
			pageView.addEventListener( ViewEventType.VodAddBtnClickEvent, function(){ 
				var indexs = arguments[2].ids;
				self.afterLogin( function(){
					pageView.listBtnStatus('loading');
					DataManager.add2VodList( indexs );
				});
			});
			//批量播放按钮
			pageView.addEventListener( ViewEventType.VodPlayBtnClickEvent, function(){
				var indexs = arguments[2].ids;
				var logined = 0;
				if( !(logined = BasicTools.isLogin()) && indexs.length >1 ){
					self.loginInits(function(){
						$('#loginLayer').hide();
						$('#myVodListBtn').show();
					});
					$('#loginLayer').fadeIn(200);
					if( BasicTools.isUA('ie8') ){
						$('#loginLayer').css('background','#fff')
						$('#myVodListBtn').hide();
					}
					return false;
				}
				
				if( indexs.length >1 || indexs.length ==1 && logined ) {
					DataManager.noNeed2Response = 1;
					DataManager.add2VodList( indexs );
				}
				self.playHandler ( indexs[0], 1 );

			});
			//播放按钮
			pageView.addEventListener( ViewEventType.SinglePlayEvent, function(){
				var indexs = arguments[2].ids
				,	logined = 0;
				
				if( BasicTools.isLogin() ){
					DataManager.noNeed2Response = 1;
					DataManager.add2VodList( indexs );
					logined = 1;
				}
				self.playHandler ( indexs[0], logined );
			});
			//添加到列表按钮
			pageView.addEventListener( ViewEventType.SingleAddEvent, function(){ 
				var indexs = arguments[2].ids;
				self.afterLogin( function(){
					pageView.listBtnStatus('loading');
					DataManager.add2VodList( indexs );
				});
			});

			//下载按钮
			pageView.addEventListener( ViewEventType.VodDownLoadBtnClickEvent, function(){ 
				var indexs = arguments[2].ids;

				var selectedResources = [];
				for( var i=0; i < indexs.length; i++ ){
					var item = DataManager.oriResources( indexs[i] );
					selectedResources.push({cid:'',url:item.url,refer:document.location.href,name:item.name});
				}
				
				console.log('selectedResources',selectedResources);
				var options = {};
				options.resources= selectedResources;
				options.failsCall = function(){console.log('download failed')};
				options.failsParam = null;
				DataManager.thunderDown(options);
			});			

			//列表重排后的处理事件
			pageView.addEventListener( ViewEventType.ReSortDataEvent, function(){
				DataManager.sortDatas( arguments[2].type );
			});
			//点击复选框事件
			pageView.addEventListener( ViewEventType.SelectEvent, function(){
				var selected = !!arguments[2].on
				var indexs = arguments[2].indexs;
				for ( var i=0, len = indexs.length; i < len; i++ ){
					var item = DataManager.resources( indexs[i] );
					var oriIndex = item.oindex;
					item['selected'] = selected;
					DataManager.setParam( oriIndex, 'selected', selected );
				}
			});
			

			// frome data events
			//添加按钮的状态改变处理事件
			self.addEventListener( DataEventType.AddListStateChangeEvent, function(){
				if( DataManager.noNeed2Response ){
					DataManager.noNeed2Response = 0;
					return;
				}
				var status = arguments[2].param;
				pageView.listBtnStatus( status || '' );

				var items = arguments[2].urls;
				for(var i=0;i < items.length; i++ ){
					var id = items[i].index,
						item = items[i].item;
					pageView.updateItem( id, item );
				}

			});
			//页面请求数据重排的事件
			self.addEventListener( DataEventType.DataSortedEvent, function(){
				self.renderPageHandler();
			});
			//每项数据更新后处理事件
			self.addEventListener( DataEventType.FetchedFileSizeEvent, function(){
				var indexs = arguments[2].indexs;
				var item = null;
				var items = DataManager.resources();
				if( indexs.length > 1){
					self.renderPageHandler();
				}
				else{
					for(var j in items ){
						var id = indexs[0];
						if( id == items[j].oindex){
							item = items[j];
							pageView.updateItem( id, item );
							break;
						}
					}
				}
				//console.log(['updateItem',index,item])
			});

		},

		renderPageHandler:function(){
			var list = DataManager.displayListRange( DataManager.EquMark );
			var leftNum = DataManager.leftNum();
			pageView.renderPage( list , leftNum );
		},

		playHandler:function( index, logined ){
            var item = DataManager.oriResources( index );
            var playUrl = item.url;
            var windowName = "vodplay";
            // 打开并播放
            var url = 'http://vod.xunlei.com/share.html?from='+ from +'&url=' + BasicTools.encode(playUrl);
            
            window.open( url, windowName );
        },

		afterLogin : function( callback ){
			var self = this;
			if(!BasicTools.isLogin()){
				self.loginInits(function(){
					$('#loginLayer').hide();
					$('#myVodListBtn').show();
					callback();
				});
				$('#loginLayer').fadeIn(150);
				if( BasicTools.isUA('ie8') ){
					$('#loginLayer').css('background','#fff');
					$('#myVodListBtn').hide();
				}
				return false;
			}
			callback();
		},
		ShowMoreHandler : function (param){
			var list = DataManager.displayListRange( param || DataManager.AddMark )
			var leftNum = DataManager.leftNum();
			pageView.renderPage( list , leftNum, !!leftNum );
		},
		loginInits : function ( callback ){
			if( !!loginMod ){
				setTimeout(function(){
					$('#login_u').focus();
				},50);
				loginMod.removeEventListener('onsuccess')
				loginMod.success(function(){ 
	            	//console.log(['loginInits loginMod success'])
	            	typeof callback == 'function' && callback();
	            });
				return;
			}
			loginMod = LoginMod;
			loginMod.init({});
            // 设置回调函数
            loginMod.error(function(code, msg){
                alert(msg);
                $('#login_p').val('');
            });
            loginMod.valid(function(msg){
                alert(msg);
            });
            loginMod.logining( function(msg){} );
            loginMod.autoerror( function(msg){ $('#login_u').focus(); } );
            // 登录成功
            loginMod.success(function(){ 
            	typeof callback == 'function' && callback();
            });
            loginMod.logout(function(){});
            loginMod.auto()
		}
	});
	var strs = ""
	function ieData(str){
		if(str != "END"){
			console.log(str)
			strs += str;
		}
		else{
			console.log(BasicTools.decode(strs));
		}
	}
	
	//php传来数据;
	if(location.href.match(/(i.vod.xunlei.com|vod.xunlei.com\/page\/lxrc\/php)/)){
		var dataObj = window.datas;
		DataManager.init( dataObj );
		DataManager.addCtrls( new PageManager() );
	}
	else if(location.href.match(/vod.xunlei.com\/page\/extension/)){
		$(window).bind("hashchange", function(){
			var string = location.hash.substr(1);
			var dataObj 
			try{
				dataObj= JSON.parse(string);
			}
			catch(e){
				dataObj= JSON.parse( BasicTools.decode(string) );
			}
			//string = BasicTools.decode(string);
			
			$(window).unbind("hashchange");
			
			DataManager.init( dataObj );
			DataManager.addCtrls( new PageManager() );
		});
	}

	console.log(location.href);

	return PageManager;
})