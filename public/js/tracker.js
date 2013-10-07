(function(){
    var MouseRecorder = {};

    /**
     * MouseRecorder.Tracker
     */
    (function(namespace){

        var instance,
        Tracker = function() {
            this.pusher = new MouseRecorder.Pusher();
            MouseRecorder.Util.addEventListener(document, 'click', this.pusher.receive, this.pusher);
        };
        Tracker.prototype = {};

        namespace.Tracker = {
            instance: function() {
                if(!instance) {
                    instance = new Tracker();
                }
                return instance;
            }
        };
    })(MouseRecorder);


    /**
     * MouseRecorder.Pusher
     */
    (function(namespace) {

        var url = 'http://mouse-recorder.herokuapp.com/api/v1/events',
            cookie = 'MouseRecorder_visitorKey',
        Pusher = function(){
            this.url = MouseRecorder.Util.getUrl();
            this.visitorKey = this.getVisitorKey();
            this.pageviewKey = MouseRecorder.Util.getUID();
        };
        Pusher.prototype = {
            receive: function(event) {
                this.push({
                    url: this.url,
                    user_key: '4k5n245j625k23nrg',
                    visitor_key: this.visitorKey,
                    pageview_key: this.pageviewKey,
                    events: [
                        {
                            x: event.pageX,
                            y: event.pageY,
                            timestamp: (new Date()).getTime()
                        }
                    ]
                });
            },
            push: function(data) {
                var request = false;
                if (window.ActiveXObject) {
                    request = new ActiveXObject('Microsoft.XMLHTTP');
                }
                else if (window.XMLHttpRequest) {
                    request = new XMLHttpRequest();
                }
                if(request) {
                    request.open('POST', url, true);
                    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    if(request.readyState != 4) {
                        request.send(MouseRecorder.Util.toString(data));
                    }
                }
            },
            getVisitorKey: function() {
                var visitorKeyCookie = MouseRecorder.CookieMonster.get(cookie);
                if(visitorKeyCookie === null || visitorKeyCookie === undefined || visitorKeyCookie.length === 0) {
                    visitorKeyCookie = MouseRecorder.Util.getUID();
                }
                MouseRecorder.CookieMonster.set(cookie, visitorKeyCookie, 60 * 60, '/')
                return visitorKeyCookie;
            }
        };

        namespace.Pusher = Pusher;
    })(MouseRecorder);


    /**
     * MouseRecorder.Util
     */
    (function(namespace) {
        namespace.Util = {
            addEventListener: function(el, event, callback, scope) {
                var _callback = function() {
                    callback.apply(scope, arguments);
                };
                if(el.addEventListener != undefined) {
                    el.addEventListener(event, _callback, false);
                }
                else if(el.attachEvent != undefined) {
                    el.attachEvent('on' + event, _callback);
                }
                else {
                    el['on' + event] = _callback;
                }
            },
            getUID: function() {
                return ((((1+Math.random())*0x10000)|0).toString(16) + (new Date().getTime()).toString(16)).substring(1);
            },
            getUrl: function() {
                return document.URL;
            },
            toString: function(obj, index) {
                var params = [];
                for(var i in obj) {
                    var key = (index == undefined) ? i : index + '[' + i + ']';
                    if(Array.isArray(obj[i])) {
                        params.push(this.toString(obj[i], key));
                    }
                    else if(typeof obj[i] === 'object') {
                        params.push(this.toString(obj[i], key));
                    }
                    else {
                        params.push(key + '=' + obj[i]);
                    }
                }
                return params.join('&');
            }
        };
    })(MouseRecorder);


    /**
     * MouseRecorder.CookieMonster
     */
    (function(namespace){
        /*!
         * cookie-monster - a simple cookie library
         * v0.2.0
         * https://github.com/jgallen23/cookie-monster
         * copyright Greg Allen 2013
         * MIT License
         */
        var monster = {
            set: function(name, value, seconds, path) {
                var date = new Date(),
                    expires = '',
                    type = typeof(value),
                    valueToUse = '';
                path = path || "/";
                if (seconds) {
                    date.setTime(date.getTime() + seconds * 1000);
                    expires = "; expires=" + date.toUTCString();
                }
                if (type === "object"  && type !== "undefined") {
                    if(!("JSON" in window)) throw "Bummer, your browser doesn't support JSON parsing.";
                    valueToUse = JSON.stringify({v:value});
                } else {
                    valueToUse = encodeURIComponent(value);
                }

                document.cookie = name + "=" + valueToUse + expires + "; path=" + path;
            },
            get: function(name) {
                var nameEQ = name + "=",
                    ca = document.cookie.split(';'),
                    value = '',
                    firstChar = '',
                    parsed={};
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) === 0) {
                        value = c.substring(nameEQ.length, c.length);
                        firstChar = value.substring(0, 1);
                        if(firstChar=="{"){
                            parsed = JSON.parse(value);
                            if("v" in parsed) return parsed.v;
                        }
                        if (value=="undefined") return undefined;
                        return decodeURIComponent(value);
                    }
                }
                return null;
            },
            remove: function(name) {
                this.set(name, "", -1);
            }
        };

        namespace.CookieMonster = monster;
    })(MouseRecorder);


    MouseRecorder.Tracker.instance();
})();