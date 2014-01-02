/*
//example
var list = {
    addr: "list.html",
    entry: "list",
    alias: {
        "list": "",
        "base": "",
        "login": "",
        "swfobject": "",
        "top-notice": "",
        "loc-store": "",
        "json": "",
        "jquery": ""
    }
};
*/
var extEntryCfg = {
    addr:"index.html",
    entry:"index",
    alias: {
        "index":""
    }
}

// doc的addr为相对于source中的doc的路径
var docArr = [ extEntryCfg ];

module.exports = {
    doc: docArr
};