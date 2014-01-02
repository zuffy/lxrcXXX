define(function(require){
    var Event = function(){
        this.init();
    }
    Event.prototype = {
        init : function() {
            this.attachEvent = this.addEventListener;
            this.detachEvent = this.removeEventListener;
            this.fireEvent = this.dispatchEvent;
            this.events = {};
        },
    	addEventListener : function(sEvent, fpNotify, tDelay) {
            if(!this.events[sEvent])
                this.events[sEvent] = [];
            for(var i = 0; i < this.events[sEvent].length; i++)
            if(this.events[sEvent][i].o == this && this.events[sEvent][i].f == fpNotify)
                return true;
            this.events[sEvent].push({
                o : this,
                f : fpNotify,
                t : tDelay
            });
            return this;
        },
        removeEventListener : function(sEvent, fpNotify) {
            if(!this.events[sEvent] || !(this.events[sEvent] instanceof Array))
                return false;
            for(var i = 0; i < this.events[sEvent].length; i++)
            if(this.events[sEvent][i].o == this && this.events[sEvent][i].f == fpNotify) {
                this.events[sEvent].splice(i, 1);
                if(0 == this.events[sEvent].length)
                    delete this.events[sEvent];
                return this;
            }
            return this;
        },
        dispatchEvent : function(sEvent) {
            if(!this.events[sEvent] || !(this.events[sEvent] instanceof Array))
                return false;
            var args = [this].concat(this.argumentsToArray(arguments));
            var listener = this.events[sEvent].slice(0);
            for(var i = 0; i < listener.length; i++)
            if( typeof (listener[i].t) == "number")
                listener[i].f.delayApply(listener[i].t, listener[i].o, args);
            else
                listener[i].f.apply(listener[i].o, args);
            return this;
        },
        argumentsToArray : function(args) {
            var result = [];
            for(var i = 0; i < args.length; i++)
            result.push(args[i]);
            return result;
        }
    }
    return Event;
})