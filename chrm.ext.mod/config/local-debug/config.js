/**
 * 本地调试环境配置文件
 * 配置nginx目录和工程调试目录
 */
var mysrc = "";
var config = {
    domain: {
        project: "vod.xunlei.com",
        js: "vod.test.com",
        other:"vod.xxx.com"
    },
    folder: {
        // 不能用'\'表示window的分隔符，因为要转义，用'/'或者'\\'代替
        nginx: "D:/Program\ Files/nginx",
        project: "D:/webserver/webroot_html/vod_xunlei/vod.lixian/",//"../.."+ mysrc +"/export/debug/",
        js: "../../source/",
        other: "D:/webserver/vodRC/"
    }
};

module.exports = config;
