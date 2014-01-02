define(function(require) {
	//导入模块
	var $ = require('jquery');
	var base = require('utils');
	var debug = base.debug;
	var JSON = require('json');
	var DataEventTypes = require('event_types');
	DataEventTypes = DataEventTypes('data');
	
	var _dataObj = null;				//保存数据对象
	var _protocoResourcesIndex = [];	//协议资源
	var _rowUrlResourcesIndex = [];		//原始链接
	var _totalNum = 0;					//总共任务数
	var _links = null;					//任务列表
	var _sortedCache = null;			//排序后的任务列表
	var _showNums = 0;					//显示的条数
	var _startNum = 0;					//起始显示位置
	var _showPerNum = debug? 96 : 10;	//显示更多增加的数目
	var defaultInitNums = 8; 			//默认页面显示条数
	var _ctrls = [];					// views 的控制器 列表
	var urlCheckingIndex = 0;			//当前任务查询标记
	var timoutFlag = 0; 				//批量查询超时
	var from = 'extlist';				//请求来源
	var timeoutTime = 3e3;				//post任务超时时间
	var isTaskSubmiting = false;		//标记当前是否有请求在处理
	var extPrevFix = 'vd';				//每项图标样式名字prevfix
	var addingTasks;					//添加任务时的url->index;
	var gISERVER = 'http://i.vod.xunlei.com/';
	var lxSERVER = 'http://dynamic.cloud.vip.xunlei.com/interface/get_unionurl_info';
	var taskConfig = {					//提交任务的配置
		proxyId : 'proxy_i',
		proxy : null
	}
	var taskTips = {					//查询返回的错误信息;
		urlNotVideo:"该链接不含视频，添加时将被过滤",
		userInfoError:"用户帐号信息验证失败，建议重新登录",
		taskContainsError:"全部任务都有错误，无法添加",
		paramError:"请求参数有误，请检查后重新添加",
		timeout:"请求超时，请稍后重试",
		svrError:"服务器繁忙，请稍后重试"
	};
	var DataManager = {					//数据模块管理
		init : function (rowdata){
			this.initTaskProxy();		//初始化任务的代理
			_dataObj = rowdata;			//保存插件传来的数据
			_totalNum = this.resources().length;
		},
		//加入对应的ctrl模块
		addCtrls : function (ctrl){
			_ctrls.push( ctrl )
		},
		//排序后缓存的任务列表
		resources : function (id){
			var ret = _sortedCache || this.oriResources();
			return typeof id != 'undefined' ? ret[id] : ret;
		},
		//数据分析后得到的 默认排序任务列表
		oriResources: function (id){
			var ret = _links || _dataObj && (_links = this.analyseResources(_dataObj.resources)) || [];
			return typeof id != 'undefined' ? ret[id] : ret;
		},
		//任务排序
		sortDatas : function ( sortBy ){
			if( !sortBy ){	
				//默认排序
				_sortedCache = null;
			}
			else if(sortBy == '__reverse__'){
				_sortedCache = this.resources().slice().reverse();
			}
			else{
				//排序方式暂时为 按名字排序、按文件大小排序, 存到副本
				_sortedCache = this.resources().slice().sort( function(a,b){
					if( sortBy == 'name' ){
						if( a[sortBy] > b[sortBy] )return  1 ;
						if( a[sortBy] < b[sortBy] )return  -1 ;
						return 0;
					}
					else if( sortBy == 'filesize' ){
						var a = parseInt(a[sortBy]) || 0;
						var b = parseInt(b[sortBy]) || 0;
						return  b - a; //大到小;
					}
					
				});
			}
			//广播数据模块的排序事件
			this.noticeController( DataEventTypes.DataSortedEvent );
		},

		//分析资源
		analyseResources : function ( res ){
			var _url
			,	prot
			,	_name = ''
			,	that = this
			,	newRes = []
			,	_ext = 'vdadd'
			,	compareLink={}
			,	_shortName = ''
			,	len = res.length

			for(var i=0; i < len; i++ ){
				if(typeof res[i].url != "string")continue;
				_url = res[i].url;
				_ext = 'vdadd'

				//标记链接是否为原始链接
				prot = /^(magnet|thunder)/.test(_url)  ? (_protocoResourcesIndex.push(i),1)
												  : (_rowUrlResourcesIndex.push(i), 0);
				// 从url提取filename ,ext
	            _name =  prot ? _url.substring( 0, _url.indexOf('&')) : base.getFileName(_url);
	            //base.log([ 'resourcesAnalyse Common.getFileExt(_url)', _name ]);
	            if( typeof compareLink[_name] == 'undefined' ){
	            	compareLink[_name] = _url;
	            }
	            else{
	            	compareLink[_name] ++;
	            	//continue;
	            }
	            //在文件名中获取扩展名
	            if(_name){
	                !prot && ( _ext = extPrevFix + base.getFileExt(_name) );
	            }else{
	            	_name = _url;
	            }
	            //缩略名
	            _shortName = _name ? base.toShortName( _name, 30, 25, 20 ) : _name;
	            //base.log([ 'resourcesAnalyse _name', _name ]);
	            //对象的所有属性;
	            var params = {
	            	name : _name,
					ext :  _ext,
					oindex : 0,
					shortName : prot ? base.toShortName( _name, 30, 25, 20 ) : _shortName,
					id:'', 
					url: _url.replace( /\&amp;/g, '&' ), 
					gcid:'',			
					inited:1,			//标记文件名查询状态,0为查询出错
					selected:0,			//标记选中状态
					isAdded:0,			//是否加入到列表了
					filesize:'--'
	            }
	            params.oindex = newRes.length;
				newRes.push(params)
            }

            that.queryNames( newRes );	//协议型连接到后台查询;
            that.getUrlsInfo( newRes );	//原始链接调用离线接口单个查询;
            return newRes;
		},
		leftNum : function(){
			return _totalNum > _showNums ? _totalNum - _showNums : 0; // 0 代表没有更多;
		},
		setParam: function( id, key, value ){
			this.oriResources(id)[key] = value;			//修改原始类表中的数据信息;
		},
		//广播出数据改动的事件;
		noticeController : function( evt, param ){
			for( var n in _ctrls ){
	    		_ctrls[n] && _ctrls[n].dispatchEvent( evt, param );
	    	}
	    },
	    //显示的数据范围
		displayListRange : function( param ){
			switch( param ){
				case DataManager.AddMark:
					this.addPerDis();
					break;
				case DataManager.SubMark:
					this.subPerDis();
					break;
				case DataManager.EquMark:
					break;
				default :
					//this.addPerDis();
					_showNums = defaultInitNums;
					break;
			}
			return this.resources().slice( _startNum, _showNums );
		},
		//显示多几条任务;
		addPerDis : function(){
			_showNums = _showNums + _showPerNum <= _totalNum ? _showNums + _showPerNum : _totalNum;
		},
		//减少几条显示任务;
		subPerDis : function(){
			_showNums = _showNums - _showPerNum > 0 ? _showNums - _showPerNum : 0;
		},
		//将任务添加到列表
		add2VodList : function( indexs ){
			var i = 0
			,	posts = []
			,	len = (indexs || []).length;
			if( len == 0 ) return;
			for( i = 0; i < len; i++ ){
				var link = this.oriResources( indexs[i] );
				posts.push( link );
			}
			!isTaskSubmiting && this.submitUrlTask( posts );
		},
		/* 提交批量任务*/
	    submitUrlTask:function( items ){
	        var self = this;
	        /* 收集选中的项 */
	        var len = items.length;
	        if(len == 0)
	            return;
	        var qureyData = { urls:[] };
	        addingTasks = {};
	        for(var i = 0; i < len; ++i ){
	            var name = items[i].name
	            name = $.trim(name);
        		//obj = { id: i, url: items[i].url, name: base.encode(name) };
        		addingTasks[i] = items[i].oindex;
	            qureyData.urls.push({ id: i, url: items[i].url, name: base.encode(name) });
	        }
	        /* 批量添加 */
	        qureyData = JSON.stringify( qureyData );
	        base.log(qureyData);
	        //self.setSubmitButtonStatus(false);
	        self.doAddTask( qureyData, self.doAddTaskDone, self.doAddTaskError );
	    },

	    doAddTask:function( data, success, error ){
	        if(data == undefined || success == undefined){
	            return -1;
	        }
	        //base.stat({from:'vodlist', p:'vodlist',f:'tasktype',ty:taskType,num:(taskType=='url' && $('#'+taskConfig.urlResultDisplayArea+' li').has('input:checked').length>0)?$('#'+taskConfig.urlResultDisplayArea+' li').has('input:checked').length : 1});
	        var pcweb = 0;
	        var self = this;
	        var userid = base.getCookie('userid');
	        var sessionid = base.getCookie('sessionid');
	        var url = gISERVER + "req_add_record?from=" + from
	        				   + "&platform=" + pcweb 
	        				   + '&userid=' + userid 
	        				   + '&sessionid='+sessionid;
	        /*
	        setTimeout(function(){
	        	error();
	        }, 1e3)
	        */
	        isTaskSubmiting = true;
	        self.vodPost(url,data,success,error);
	    },

	    vodPost:function(url,data,success,error,tryTimes){
		    var args = arguments;
	    	var callee = args.callee;
	    	var self = this;
	    	if(tryTimes > 3){
	    		//throw error;
	    		//return;
	    	}
	    	if(typeof taskConfig.proxy.$ == 'undefined'){
	    		setTimeout(function(){
	    			callee.call(self,url,data,success,error,tryTimes+1);
	    		},200)
	    		return;
	    	}

	    	taskConfig.proxy.$.ajax({
	    		type: "POST",
	    		dataType:'json',
	    		url:url,
	    		data:data,
	    		timeout:timeoutTime,
	    		error:function(){error()},
	    		success:function(resp){success(resp)}
	    	});
	    },
	    doAddTaskError:function(){
	    	//self.showSubmitTips(2,taskTips.timeout);
	    	isTaskSubmiting = false;
	    	DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error', urls:[] });
	    },
	    
	    doAddTaskDone:function(data){
	    	isTaskSubmiting = false;
	    	var self = this;
	    	if(data.resp){
	    		try{
		    		var ret = data.resp.ret;
		    		var _errorMsg = '';
		    		if(ret==0){
		    			var _res = data.resp.res;
		    			var _len = _res.length;
		    			var addedNum = 0
		    			var addedIndexs = [];
		    			var oi;
		    			var link;
		    			for( var i=0; i<_len; i++ ){
		    				if( _res[i].result == 0 ){
		    					if( typeof addingTasks[_res[i].id] !== 'undefined' ){
		    						oi = addingTasks[_res[i].id];
		    						link = DataManager.oriResources(oi);
		    						link.isAdded = true;
		    						addedIndexs.push({index:oi, item:link})
		    					}
		    					addedNum ++ ;
		    				}else if( _res[i].result == 8 ){
		    					_errorMsg = taskTips.urlNotVideo;
		    				}else if( _res[i].result == 6 || _res[i].result == 2 ){
		    					_errorMsg = taskTips.paramError;
		    				}else{
		    					_errorMsg = taskTips.svrError;
		    				}
		    			}
	    				addedNum > 0 ? 
	    				DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, { param : 'added', urls:addedIndexs }) : 
	    				DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error', urls:addedIndexs });
	    				return;
	    				/*
		    			if( addedNum == 0 )
		    				_errorMsg = taskTips.taskContainsError;
		    			base.log([2,_errorMsg]);*/
		    			//DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error'} );
		    		}else{
		    			if(ret==1){
	                        _errorMsg = taskTips.userInfoError;
	                    }
						else if(ret==3)
							_errorMsg = taskTips.timeout;
						else
							_errorMsg = taskTips.svrError;
		    			DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error', urls:[] });
		    			base.log(_errorMsg);
		    		}
		    	}catch(e){
		    		DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error', urls:[] });
		    	}
	    	}else{
	    		_errorMsg = taskTips.svrError;
	    		base.log(_errorMsg);
	    		DataManager.noticeController( DataEventTypes.AddListStateChangeEvent, {param : 'error', urls:[] });
	    	}	    	
	    },	  

	    thunderDown:function(options){
			var that = this;
			var len = options.resources.length;
			if( base.isUA('ie') ){
				try{
					var thunderInstance = base.getCurrentThunder();
					console.log(0)
					if(len < 1){
						console.log(1)
						return false;
					}
					else if(len == 1 && thunderInstance.download){
						console.log(2)
						var cid = options.resources[0].cid,url = options.resources[0].url,refer = options.resources[0].refer,name = options.resources[0].name;
						thunderInstance.download(cid, url, refer, name);
					}
					else if(len >1 && thunderInstance.batchDownload){
						console.log(3)
						thunderInstance.batchDownload(options.resources,options.resources[0].refer);
					}
					else{
						 //alert('请先安装迅雷7');
						alert('您尚未安装迅雷下载软件，请下载安装最新版后重试。');
						options.failsCall(options.failsParam);
						return;
					}
				}catch(e){
					console.log(e);
				    // alert('请先安装迅雷7');
					alert('您尚未安装迅雷下载软件，请下载安装最新版后重试。');
					options.failsCall(options.failsParam);
					return;
				}
			}else{
				//非ie内核接口
				//var items = [{'cid':cid,'url':url,'name':name}];
				function chromeAndFFDownload(items){
					var npXLPlugin2 = navigator.mimeTypes["application/np_xunlei_plugin.2"];
					if (npXLPlugin2) {
						var xlPlugin = document.createElement("embed");
						xlPlugin.style.visibility = "hidden";
						xlPlugin.type = "application/np_xunlei_plugin.2";
						xlPlugin.width = 0;
						xlPlugin.height = 0;
						document.body.appendChild(xlPlugin);
						// 批量任务URL拼接方式：ReferUrl#@$@#LinkCount#@$@#LinkUrlUrl#@$@#Comments#@$@#Cookie#@$@#CID#@$@#StatURL

						var g_strSplitter = "#@$@#";
						// ReferUrl（引用页，当前网页）
						var strUrls = "";
						strUrls = strUrls.concat(g_strSplitter);
						// LinkCount（任务个数）
						strUrls = strUrls.concat(items.length, g_strSplitter);
						for(var i = 0; i < items.length; i ++){
						    // LinkUrl
						    strUrls = strUrls.concat(items[i]['url'], g_strSplitter);
						    // filename
						    strUrls = strUrls.concat(items[i]['name'], g_strSplitter);
						    // Comments（任务注释）
						    strUrls = strUrls.concat("", g_strSplitter);
						    // Cookie
						    strUrls = strUrls.concat("null", g_strSplitter);
						    // CID
						    strUrls = strUrls.concat("", g_strSplitter);
						    // StatUrl
						    strUrls = strUrls.concat("", g_strSplitter);
						}
						xlPlugin.DownLoadListByThunderPlugin(strUrls);
					}
					else{
						var url = items[0]['url'];
						var npXLPlugin = navigator.mimeTypes["application/np_xunlei_plugin"];
						if (npXLPlugin) {
						    var xlPlugin = document.createElement("embed");
						    xlPlugin.style.visibility = "hidden";
						    xlPlugin.type = "application/np_xunlei_plugin";
						    xlPlugin.width = 0;
						    xlPlugin.height = 0;
						    document.body.appendChild(xlPlugin);
						    xlPlugin.DownLoadByThunderPlugin(url);
						}
						else{
						    //alert("未安装迅雷");
							alert('您尚未安装迅雷下载软件，请下载安装最新版后重试。');
							options.failsCall(options.failsParam);
							return;
						}
					}
				}
				chromeAndFFDownload(options.resources);
			}
		},  

	    openAndPlay:function( playUrl, isLogined ){
            // 默认为非会员 v=4
            var userinfo = base.getCookie('userid')+'_'+'4'+'_'+base.getCookie('sessionid');
            playUrl = encodeURIComponent(playUrl);
            var url = [ "http://vod.xunlei.com",
                "/iplay.html?",
                'uvs=', userinfo,
                '&url=', playUrl,
                '&tryplay=' + (1-isLogined),
                '&from=', from];

            url = url.join("");
            /*if(fileName){
                url += '&filename=' + base.encode(fileName);
            }*/
            window.open(url, '_blank');
        },
	    initTaskProxy : function(){
        	document.domain = "xunlei.com"; 
	    	taskConfig.proxy = document.getElementById(taskConfig.proxyId).contentWindow;	    	
	    },
	    /* 查询离线接口，获取单个文件的文件名，大小，高速等信息 */
	    getUrlsInfo : function( resources ){
	    	//base.log(resources);return;
	    	if( !resources[ _rowUrlResourcesIndex[urlCheckingIndex] ])return;
	    	var url = resources[_rowUrlResourcesIndex[urlCheckingIndex]].url;
	    	$.getScript(lxSERVER+'?url='+ encodeURIComponent(url) +'&callback=queryunionurl');
	    },
	    /* 批量查询文件名 */
		queryNames:function( resources ){
			var that = this;
			var legalDatas = [];  // 发送给后台的请求
			var curReqNum = _protocoResourcesIndex.length;
			var id = 0;
		    for(var i=0; i<curReqNum; i++){
		    	id = _protocoResourcesIndex[i];
		    	var curUrl = resources[id].name || resources[id].url ;
		    	legalDatas.push({ id:id, url:encodeURIComponent(curUrl) });
			}
			if( legalDatas.length > 0 ){
				var url = gISERVER + "req_video_name?from=vlist&platform=0";
				var len = legalDatas.length;
				var j = 0
				var size = 50;
				var end = size < len ? size : len;
				var func = function(resp){
					that.queryNamesDone(resp);
					if( end < len ){
						j = end;
						end = end+size < len ? end+size : len;
						setTimeout(function(){
							that.vodPost( url, JSON.stringify({ urls: legalDatas.slice( j, end ) }), func, function(){/* error handler */}); 
						},500)
					}
					else{
						//that.noticeController( DataEventTypes.InitPageEvent )
						//that.getUrlsInfo(resources);
					}

				};
				setTimeout(function(){
					that.vodPost( url, JSON.stringify({ urls: legalDatas.slice( j, end ) }), func, function(){/* error handler */}); 				
				},100)
			}
			else{
				//异步调用，否则会死循环;
				/*setTimeout(function(){
					that.noticeController( DataEventTypes.InitPageEvent )
				},10)				
				that.getUrlsInfo(resources);
				*/
			}
		},
	    /* 批量查询文件名回调 */
	    queryNamesDone:function(resp){
	    	var that = this;
	    	var resp = resp.resp;
	    	if(resp){
		    	var ret = resp.ret;
		    	var res = resp.res;
		    	var indexs = [];
		    	if( ret==0 ){
		    		if(res.length > 0 ){
		    			var resultNum = res.length;
			        	for(var i = 0; i < resultNum; i++){
							var item = res[i]
							var id = item.id;
							var exts = [ 'mkv', 'xv', 'rm', 'mp4', '3gp', 'wmv', 'asf',
										 'vob', 'mov', 'm4v', 'flv', 'ts', 'bt', 'avi',
										 'rmvb', 'mpg', 'mpeg', 'f4v',
										 'MKV', 'XV', 'RM', 'MP4', '3GP', 'WMV', 'ASF',
										 'VOB', 'MOV', 'M4V', 'FLV', 'TS', 'BT', 'AVI',
										 'RMVB', 'MPG', 'MPEG', 'F4V$'].join('$|');
							var reg = new RegExp('\\.('+ exts +')\\b');
							var tmpExt = ''
							var link = that.oriResources(id);
							if(item.result==0){
								link.name = base.decode(item.name);
								link.inited = 1;
								link.shortName = base.toShortName( link.name, 30, 25, 20 );
								(tmpExt = reg.exec(item.name)) && (link.ext = 'vd'+ tmpExt[1].toLocaleLowerCase() );
								//base.log([id,tmpExt]);
							}else{
								/*出现错误*/
								link.inited = 0;
							}
							indexs.push(id);
			          	}
			        }
			        DataManager.noticeController( DataEventTypes.FetchedFileSizeEvent, {indexs : indexs} )
		        }else{
		           /*服务器错误*/
		           //_links[id].inited = 0;
		        }
	     	}
	    }

    }

    window['queryunionurl'] = function(gcid,filesize,shortName,name,ext,speedLink){
    	//base.log(arguments);
    	var id  = _rowUrlResourcesIndex[urlCheckingIndex]
    	if(gcid && gcid !="0")
			_links[id]['gcid'] = gcid;
		if(filesize && filesize !="0"){
			_links[id]['filesize'] = filesize;
			// 	更新文件大小
		}
		if( !!shortName && shortName !="0" )
			_links[id]['shortName'] = base.decode(shortName).replace( /<.*?>/g, '' );
		if(name && name !="0")
			_links[id]['name'] = base.decode(name);
		if(ext && ext !="0")
			_links[id]['ext'] = extPrevFix + ext;
		if(speedLink=='1'){}

		DataManager.noticeController( DataEventTypes.FetchedFileSizeEvent, {indexs : [id]} );
    	
    	urlCheckingIndex ++;

		if( urlCheckingIndex < _rowUrlResourcesIndex.length ){
			url = _links[ _rowUrlResourcesIndex[urlCheckingIndex] ].url;
			setTimeout(function(){
				$.getScript(lxSERVER+'?url='+ encodeURIComponent(url) +'&callback=queryunionurl');
			},200);
		}

    }

    $.extend( DataManager, {
    	//global options;
    	noNeed2Response : 0,
    	//sign;
    	AddMark : '+',
    	SubMark : '-',
    	EquMark : '='
    })

    return DataManager
});