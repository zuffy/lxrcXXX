var dbg = 1;
var timer = null;
var reqCount = 0; //浏览器bug处理;
var gAciton = null;
var iServer = 'i.vod.xunlei.com';
var beforeInstallTabs = [];     //插件安装前的tab页面
//服务器上报;
function stat () {
    //var i = new Image();    
    return true;
}
//调试信息;
function debug(str){
    dbg && console.log(str);
}
getTabsID();

//插件安装
function onInstall() {
    debug("Extension Installed");
    // update current page & execute extension;
    try{
        
        chrome.tabs.reload(null, {
            bypassCache: true
        });
    } catch (e) {
        chrome.tabs.getSelected(null, function(tab) {
            var currentURL = tab.url;
            if(currentURL) {
                chrome.tabs.update(tab.id, {url: currentURL});
            }
        });
    }
}
//插件更新后跳去help页面
function onUpdate() {
    //go to help page;
}
//获取插件版本信息
function getVersion() {
    //return manifest object;
    var details = chrome.app.getDetails();
    return details.version;
}
//检测插件安装和更新情况
function check_Install_Update(){
    // 检测升级.
    var currVersion = getVersion();
    var prevVersion = localStorage['version']
    // check update ;
    if (currVersion != prevVersion) {
        // 插件是否刚刚安装完毕.
        if (typeof prevVersion == 'undefined') {
          onInstall();
        } else {
          onUpdate();
        }
        localStorage['version'] = currVersion;
    }
}

//获取当前页面的tabId;
function getTabsID(){
    //alert(cacheTabNum++);
    var win;
    var tabId;
    //使用getAllInWindow方式时用的方法
    function getID( tabs ){
        var tabCount = tabs.length;
        for ( var i = 0; i < tabCount; i++ ){
            tabId = tabs[i] && tabs[i].id;
            beforeInstallTabs.push(tabId)
        }
        console.log('安装前的tabs:',beforeInstallTabs);
    }
    
    chrome.windows.getCurrent(function(win){
        chrome.tabs.getAllInWindow(win.id, getID)
    });
}

//缓存每个页面的任务数量，浏览器关闭后cache会自动清空;
var cacheTabNum = {};
//360 chrome 内核
var curChromeTab = [];
//图标下标颜色
var CLR = { show:[243, 148, 25, 255], hide:[ 0, 0, 0, 0] }
//信息处理hash表
var msgHandlers = {};

//初始化listeners
function addListeners(){
    //右键菜单
    chrome.contextMenus.create({
        title: chrome.i18n.getMessage('pageMenu'),
        contexts: ['page'],
        onclick: function(info, tab) {
            reqCount = 0;
            startClip( tab.id, 'contextMenu' );
        }
    });
    //点击图标
    chrome.browserAction.onClicked.addListener(function (tab){
        reqCount = 0;
        startClip(tab.id, 'browser');
        return;
    });
    //处理页面内传来的消息
    chrome.extension.onRequest.addListener(function (msg, from, callback){
       //debug(msg.result)
        var tabId = msg.id;
        var fromId = from.tab.id;
        var res = msg.result;
        //debug( 'current msg : ' + res );
        if( typeof msgHandlers[res] == 'function'){
            msgHandlers[res]( fromId, msg );
        }
        else{
            debug( 'handler for '+ res +' had not regist yet' );
        }
        return;
    });
    //监听标签切换事件
    chrome.tabs.onSelectionChanged.addListener(function (tabId, winId){
        //如果有对应的缓存数据则显示，否则清除图标数字.
        if( typeof cacheTabNum[tabId] == 'undefined' ){
            chrome.browserAction.setBadgeBackgroundColor({ color: CLR.hide });
            chrome.browserAction.setBadgeText({ text:'' });
        }
        else{
            chrome.browserAction.setBadgeBackgroundColor({ color: CLR.show });
            var num = cacheTabNum[tabId] > 99 ? '99+' : cacheTabNum[tabId];
            chrome.browserAction.setBadgeText({ text:String(num) });
        }
        return;  
    });    
} 
//注册消息处理函数;
function registerHandlers(){
    //新链接处理
    msgHandlers['foundLinks'] = function (tabId, msg){
        cacheTabNum[tabId] = msg.num;
        //console.log(cacheTabNum);
        chrome.browserAction.setBadgeBackgroundColor({ color: CLR.show });
        var num = msg.num > 99 ? '99+' : msg.num;
        chrome.browserAction.setBadgeText({ text:String(num) });
    }
    // 记录 tab id
    msgHandlers['whoami'] = function (tabId, msg){

        var tmpIndex = beforeInstallTabs.indexOf(tabId);
        (tmpIndex > -1) && beforeInstallTabs.splice( tmpIndex, 1 );

        tmpIndex = curChromeTab.indexOf(tabId);
        ( tmpIndex > -1 ) ? (curChromeTab[tmpIndex] = tabId) : curChromeTab.push(tabId);
        try{
            chrome.tabs.sendRequest(tabId, { msg:'initTabId', id:tabId });
        }catch(e){
            console.log(e);
        }
        //contentScript初始化时重置一次。
        msgHandlers['initLinks'](tabId);
    }
    //打开新标签时初始化重置基本信息
    msgHandlers['initLinks'] = function (tabId, msg){
        if( typeof cacheTabNum[tabId] != 'undefined' ){
            delete cacheTabNum[tabId];
        }
        chrome.browserAction.setBadgeBackgroundColor({ color: CLR.hide });
        chrome.browserAction.setBadgeText({ text:''});
    }
}
//用户点击事件处理
var tid = null;
var startClip = function(tabId, action) {
    
    var altTip = '浏览器当前模式不支持云播，请在地址栏末尾按钮处切换到极速模式';
    clearTimeout(tid);
    try{
        var limit = 0;
        chrome.tabs.executeScript(tabId, {file: "js/check.js"},function () {
            tid = setTimeout(function(){
                alert(altTip)
            },800);
            if(++limit < 2){
                chrome.tabs.sendRequest(tabId, {
                    id: tabId,
                    msg: 'check'
                },function (){
                    clearTimeout(tid);
                    runHandler (tabId, action)
                });
            }            
        });
    }catch(e){
        alert('请刷新页面重试');
        trace(e)
    }
    

    //清掉图标的数字
    chrome.browserAction.setBadgeBackgroundColor({ color: CLR.hide });
    chrome.browserAction.setBadgeText({ text:'' });

};


function runHandler (tabId, action){
    //显示程序界面，如果200ms后没有响应，那么提示用户在极速模式下使用。注:chrome不需要。
    var executed = false;
    var altTip = '';
    var tmpIndex;
    if( (tmpIndex = beforeInstallTabs.indexOf(tabId)) > -1 ){
        altTip = '在地址栏输入并访问您常去的视频下载网站，点击云播按钮，即可检测改网页上的视频下载资源，直接播放或者添加到云播列表。';
        if( truthBeTold = window.confirm(altTip) ){
            beforeInstallTabs.splice( tmpIndex, 1 );
            chrome.tabs.reload(tabId);
        }
        return ;
    }
    if( curChromeTab.indexOf(tabId) == -1 ){
        console.log('没有联系上页面~');
        return;
    }
    //用户操作后清除临时缓存的数字
    if( typeof cacheTabNum[tabId] != 'undefined' ){
        delete cacheTabNum[tabId];
    }
    
    altTip = '浏览器当前模式不支持云播，请在地址栏末尾按钮处切换到极速模式';
    (function(){
        tid = setTimeout(function(){
            alert(altTip);
        },1000);
        chrome.tabs.sendRequest(tabId, { msg:'tabAction', id:tabId, act:action }, function (){
            clearTimeout(tid);
        });
        
    })();
    
}

//初始化;
check_Install_Update();
registerHandlers();
addListeners();