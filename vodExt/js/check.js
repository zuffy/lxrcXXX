/*
** 功能：只是为了 check 页面和插件是否能通信;
*/
var limit = 0;
chrome.extension.onRequest.addListener(function (msg, sender, sendResponse) {
    if (msg.msg === 'check') {
        limit<1 && sendResponse && sendResponse();
        limit ++;
    }
    //sendResponse({farewell: "goodbye"});
} );