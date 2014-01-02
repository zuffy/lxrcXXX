
lxrcTools = function(){
    var n = document
    ,   logEnabled = 0;

    return {
        trim: function(e) {
            return typeof e != "string" ? e : e.replace(/^\s+/, "").replace(/\s+$/, "")
        },
        trimPage:function(str,ch){
            var r= str||'';
            if((typeof ch) != 'undefined'){
                r = r.replace(/\s+/g,ch);//去空格
            }
            r = r.replace(/<(style|script|object|iframe|h\d)[\s\S]*?<\/\1>/g,'') // <style>....</style>
            .replace(/=\s*"(return |javascript:|)\w*?(\(.*?\))?(;|)"/g,'')//去掉行内代码: =" xx(xx  s) "  或 = "return xx(this)" 或="javascript:void(0)";
            .replace(/>[\s\S]*?</g,'><').replace(/<[^>]*</g,'<').replace(/>[^<]*>/g,'>')//去除正文
            .replace(/(style|title|id|class|target|type)="[^"]+"/g,'')//r = r.replace(/&quot;|&amp;|&lt;|&gt;/g,'">');//如果链接有这些符号那么这种链接出错~~
            .replace(/<[^=]*?>/g,'') // <a /> 或是  </close>
            return r;
        },
        el: function(e) {
            return n.getElementById(e)
        },
        mkel: function(e, t) {
            try {
                var r = n.createElement(e);
                return t && t.appendChild(r), r
            } catch (i) {
                return !1
            }
        },
        serverlog: function(e) {
            var t = new Image, r = n.clipperBaseURL + n.logurl;
            //t.src = r + "&s=" + e
        },
        log: function(e) {
            if (!logEnabled)
                return !1;
            if (typeof console.log == "undefined")
                return;
            console.log(e)
        },
        getCharSet: function() {
            return document.charset.toLowerCase() || document.characterSet.toLowerCase()
        },
        HTMLEncode: function(e) {
            var t = ""
            , n = e.length
            , r = navigator.userAgent.toLowerCase()
            , i = /msie/.test(r) ? parseFloat(r.match(/msie ([\d.]+)/)[1]) : !1;
            if (i >= 7)
                for (var s = 0; s < n; s++)
                    t += e.charCodeAt(s) + " ";
            else
                for (var s = 0; s < e.length; s++) {
                    var o = e.charCodeAt(s), u = e[s];
                    o > 127 ? t += "&#" + o + ";" : u == ">" ? t += "&gt;" : u == "<" ? t += "&lt;" : u == "&" ? t += "&amp;" : t += e.charAt(s)
                }
            return t
        },
        unicodeEncode: function(e) {
            var t = "";
            if (typeof e == "string")
                for (var n = 0; n < e.length; n++) {
                    var r = e.charCodeAt(n);
                    r > 127 ? t += "&#" + r + ";" : t += e.charAt(n)
                }
            return t
        },
        decode : function(str) {
            var r = '';
            try {r = decodeURIComponent(decodeURIComponent(str));   } catch(e) {
                try {r = decodeURIComponent(str);} catch(e) {r = str;}
            }
            return r;
        },
        encode : function(str) {
            return encodeURIComponent(str);
        },
        /** base64解码 */
        base64decode : function(str) {
            var c1, c2, c3, c4;
            var i, len, out;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                do {
                    c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while ( i < len && c1 == - 1 );
                if (c1 == -1) break;
                do {
                    c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while ( i < len && c2 == - 1 );
                if (c2 == -1) break;
                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 == 61) return out;
                    c3 = base64DecodeChars[c3];
                } while ( i < len && c3 == - 1 );
                if (c3 == -1) break;
                out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 == 61) return out;
                    c4 = base64DecodeChars[c4];
                } while ( i < len && c4 == - 1 );
                if (c4 == -1) break;
                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
            }
            return out;
        },
        genRegTypes:function(){ //生成需要索引的文件扩展;
            var r = '';
            for(var i in arguments){
                for(var j in arguments[i]){
                    r += '|'+j;
                }
            }
            return r.substr(1);
            
        },
        
        /* 截取字符串 
        *
        *   
        */
        shortenStr : function( str, length, ext ){
            if( typeof(str) != 'string' || !str ){
                return str;
            }
            var _length = length || 10;
            var _strLen = str.length;
            var _ext = ext || '...';
            var _cutString ;
            var _lenCount = 0;

            if( _strLen <= _length/2 ){
                return str;
            }
            for (var i = 0; i < _strLen ; i++ ) {
                if(str.charAt(i).charCodeAt(0) > 128){
                    _lenCount += 2;
                } else {
                    _lenCount += 1;
                }

                if (_lenCount > _length) {
                    _cutString = str.substring(0, i);
                    break;
                } else if (_lenCount == _length) {
                    _cutString = str.substring(0, i + 1);
                    break;
                }else{
                    _cutString = str.substring(0, i);
                }
                
            }
            return _cutString + _ext;
        }
    };

    
}();
//json
if(typeof JSON!=='object'){JSON={}}(function(){'use strict';function f(n){return n<10?'0'+n:n}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key)}if(typeof rep==='function'){value=rep.call(holder,key,value)}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null'}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null'}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' '}}else if(typeof space==='string'){indent=space}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify')}return str('',{'':value})}}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j}throw new SyntaxError('JSON.parse')}}}());