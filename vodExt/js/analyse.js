var PageAnalyser = (function(){
    
	var videoExt = ['rmvb', 'mp4', 'mkv', 'avi', 'wmv', 'rm',
                    'flv' , '3gp', 'ts' , 'asf', 'mpg', 'mov', 
                    'mpeg', 'm4v', 'vob', 'xv' , 'f4v'].join('|');

    //如果为白名单内的网站不必提示找到新链接;
    var selfList = ['vod.xunlei.com', '10.10.2.201:8800',
                    '10.10.2.201:8801', '221.238.25.144:8801',
                    '61.147.76.6','222.141.53.5']

    var specialSiteList = {'http://kuai.xunlei.com/':kuaichuan_getPageLinks}
    var inSpecial = false;


    var qMode = '<(HTML|BODY|SCRIPT|STYLE|H\d|DIV|BR|P|UL|LI|A)[\s\S]+</\1>';

	//链接转换，去重;
    function translate_links ( inParam ){
        
        var self = this
        ,   result = {} //返回值
        ,   regType = videoExt//Common.genRegTypes( videoExt );//'rmvb|avi|mp4|mkv|wmv|rm|flv|3gp|rar|zip|jpg';
        ,   simpEd2kReg = new RegExp('ed2k://\\|file\\|.*\\.('+regType+')\\|','g')
        ,   thunderRowLinkReg = new RegExp('(http|ftp)://.*\\.('+regType+')','')
        ,   simpRowLinkReg = new RegExp('(http|ftp)://.*\\.('+regType+')$','');
        
        inParam = inParam || {};

        for(var i in inParam){
            
            var _url = inParam[i].replace('&amp;','&');
            var _uri = _url;
            var isThunder = 0;
            if( !_uri || typeof _uri != 'string' || _uri.length < 1 ){
                continue;
            }
            //先把thunder链接转成原始链接，再一步步过滤;
            if( _uri.indexOf('thunder') === 0 ){
                isThunder = 1;
                _uri = ThunderTransUrl.thunderdecode(_uri);
            }
            
            //部分链接被encode过,转换后仍需尝试decode;
            _uri = Common.decode( _uri );

            //转换后的链接处理;
            if( _uri.indexOf('ed2k') === 0 ){   //ed2k链接
                if( !simpEd2kReg.test(_uri) )continue;
            }
            else if (_uri.indexOf('magnet') === 0 ){    //磁力链
            }
            else if(!inSpecial){
                if( isThunder ){    //如果是thunder简单验证下是否为视频格式文件
                    if( !thunderRowLinkReg.test(_uri) )continue; //原始链接
                }else{              //如果不是，需要扩展名结尾
                    if( !simpRowLinkReg.test(_uri) )continue; //原始链接
                }
            }
            else{
                var videoReg = new RegExp('\\.('+videoExt+')\\?')
                console.log(videoReg.test(_uri))
                if(!videoReg.test(_uri))continue;
            }

            //重复的链接去掉;
            //_uri && ( result[_uri] = result[_uri] ? result[_uri] + 1 : 1 );
            _uri && (result[_uri] = _url);
        }
        
        return result;
    }
    
	/*获取有用链接*/
    function normal_getPageLinks ( page ){
        if(!page){
            return false;
        }
        var str= page
        ,   regStr = 'thunder://|ed2k://|magnet:\\?'
        ,   regLongStr = 'thunder%3A%2F%2F|ed2k%3A%2F%2F|magnet%3A%3F'
        ,   regType = videoExt//'rmvb|avi|mp4|mkv|wmv|rm|flv|3gp';
        ,   patternProtocal = new RegExp('<[^>]+=(\'|")((?:'+ regStr + '|' + regLongStr +')[^\'"]+)(\\3)[^>]+>', 'g' )
        ,   patternLinkEncode = new RegExp('<[^<]+?((http|ftp)%3A%2F%2F[^"]+\.('+ regType +')).*?>', 'g')
        // http://xxx/xx/abc.mp4
        ,   patternRowLink = new RegExp( '(http|ftp)://([^/]+/)+[^\\|\\\\:/=\\*\\?\\&]+?\\.('+ regType +')','g') //new RegExp('(http|ftp)://([^"](?!(http|ftp)://))+\\.('+ regType +')[\\b"\\?]', 'gi')    //[\\b"]
        ,   result =[]; //抓取的链接;
        
        //不支持2b模式
        if( str.match( new RegExp( qMode, 'g' ) ) > 4 ){
            alert("暂时不支持此页面") 
            return false;
        }
        //去掉空标签等无用标签和文本
        //test
		//str = '<a b="magnet:?btn:123465789"> '+str;
        str = Common.trimPage( str );
        //特定协议的链接
        str = str.replace ( patternProtocal, function (a,b,c){/*,d,e,f,g,h,i,j*/
            if(!!c)
            result.push( c );
            return '';
        });

        //编码过的原始链接
        var encodedLinks=[]
        str = str.replace ( patternLinkEncode, function (a,b,c){/*,d,e,f,g,h,i,j*/
            if(!!b)
            encodedLinks.push(b);
            return '';
        });
        //将编码过的链接decode,加入str中;
        str += '\n'+decodeURIComponent(encodedLinks.join('\n'));
        
        //在新的内容中招抓取原始链接;
        var tmp ;
        str = Common.decode(str);
        if( tmp =  str.match(patternRowLink) ){
            result = result.concat( tmp ) 
        };
        
        var msg = ''
        //将抓取的链接转码和初步去重;
        result = translate_links(result);
        //that.myLog('getPageLinks',result);
        
        //链接数据转为指定格式r数组。
        var r = [];
        for( var i in result){
            msg += '\n'+i+'====='+result[i];
            r.push(result[i]);
        }
        //Common.log(msg);
        Common.log(['translate_links:',r]);
                
        return r;
    }
	
	function kuaichuan_getPageLinks( page ){

        if(!page){
            return false;
        }

        var str= page
        ,   regStr = 'thunder://|ed2k://|magnet:\\?'
        ,   regLongStr = 'thunder%3A%2F%2F|ed2k%3A%2F%2F|magnet%3A%3F'
        ,   regType = videoExt//'rmvb|avi|mp4|mkv|wmv|rm|flv|3gp';
        ,   patternProtocal = new RegExp('<[^>]+=(\'|")((?:'+ regStr + '|' + regLongStr +')[^\'"]+)(\\3)[^>]+>', 'g' )
        ,   patternLinkEncode = new RegExp('<[^<]+?((http|ftp)%3A%2F%2F[^"]+\.('+ regType +')).*?>', 'g')
        // http://xxx/xx/abc.mp4
        ,   patternRowLink = new RegExp( '(http|ftp)://dl([^/]+/)+?.*?verno=1','g') //new RegExp('(http|ftp)://([^"](?!(http|ftp)://))+\\.('+ regType +')[\\b"\\?]', 'gi')    //[\\b"]
        ,   result =[]; //抓取的链接;
        
        //不支持2b模式
        if( str.match( new RegExp( qMode, 'g' ) ) > 4 ){
            alert("暂时不支持此页面") 
            return false;
        }
        //去掉空标签等无用标签和文本
        //test
        //str = '<a b="magnet:?btn:123465789"> '+str;
        str = Common.trimPage( str );
        //特定协议的链接
        str = str.replace ( patternProtocal, function (a,b,c){/*,d,e,f,g,h,i,j*/
            if(!!c)
            result.push( c );
            return '';
        });

        //编码过的原始链接
        var encodedLinks=[]
        str = str.replace ( patternLinkEncode, function (a,b,c){/*,d,e,f,g,h,i,j*/
            if(!!b)
            encodedLinks.push(b);
            return '';
        });
        //将编码过的链接decode,加入str中;
        str += '\n'+decodeURIComponent(encodedLinks.join('\n'));
        
        //在新的内容中招抓取原始链接;
        var tmp ;
        str = Common.decode(str).replace('&amp;');
        if( tmp =  str.match(patternRowLink) ){
            result = result.concat( tmp ) 
        };
        
        var msg = ''
        //将抓取的链接转码和初步去重;
        result = translate_links(result);
        //that.myLog('getPageLinks',result);
        
        //链接数据转为指定格式r数组。
        var r = [];
        for( var i in result){
            msg += '\n'+i+'====='+result[i];
            r.push(result[i]);
        }
        //Common.log(msg);
        Common.log(['translate_links:',r]);
                
        return r;
	}

	//out
	return {
		
		searchTime: new Date().getTime(),

		links: [],

		pageHtml: '',

		linksNum: 0,

		resources: [],

		cacheResources: [],

		//文本分析;
        analysePage: function ( pageString, callback ){
            
            var self = this,
            	_length = 0,     //抓取的链接长度;
            	analyseFunc = normal_getPageLinks,
                _links = [],     //保存链接
            	targ = /http:\/\/([^\/]+).*/ig.exec( location.href )[1] || '',
            	noticeNew = callback

            //更新分析时间;
            self.searchTime = new Date().getTime();
            //页面html
            self.pageHtml = pageString;
            for(var i in specialSiteList){
            	if(location.href.indexOf(i)>-1){
            		analyseFunc = specialSiteList[i];
                    inSpecial = true;
                    break;
            	}            
            }
            
            //页面抓取的资源链接
            _links = self.links =  analyseFunc( Common.decode(pageString) );

            //如果无新链接则返回;
            if( 0 >= _links.length ){return;}

            var i = 0;
            var   resourcesItem = { id:'', type:'', url:'', cid:'', filesize:'--', shortName:'', name:'', ext:'', speedLink:0 }
            this.resources = [];
            for( var key in _links){
                resourcesItem = { id:'', url:'', gcid:'',
                                  filesize:'--', shortName:'', name:'', ext:'', speedLink:0 };
                var _url = _links[ key ];
                if(!_url){
                    continue;
                }
                resourcesItem.id = 'video_' + i;
                resourcesItem.url = _url;
                this.resources.push(resourcesItem);
                
                i++;
            }
            self.linksNum = i;
            
			//自域检测            
            (selfList.indexOf(targ) == -1) && setTimeout(function(){
            	noticeNew && noticeNew( self.linksNum );
            },10);

            //outter result
            var ret = {
            	time : this.searchTime,
                source : JSON.stringify(this.locationObj),
                page : Common.encode( self.pageHtml ),
                listNum : this.linksNum,
                resources : this.resources
            }

            return ret;
        },

        test: function(){console.log('ok')}



	}
	
})()