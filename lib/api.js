"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var Api = /** @class */ (function () {
    function Api(definition, transport, config, debugName) {
        var _this = this;
        if (config === void 0) { config = config_1.DefaultConfig; }
        if (debugName === void 0) { debugName = ''; }
        this.debugName = debugName;
        this.handleRemoteCall = function (v) {
            if (_this.config.debug) {
                console.log("Api_" + _this.debugName + " handleRemoteCall: \"" + JSON.stringify(v) + "\"");
            }
            var data = v;
            var func;
            if (!data)
                throw new Error('Api: handleRemoteCall failed, undefined data');
            // TODO: validate ApiProtocol
            if (data.method) {
                if (!_this.definition.selfMethods || !_this.definition.selfMethods[data.method]) {
                    console.error("method '" + data.method + "' not found");
                    return;
                }
                if (_this.config.debug)
                    console.log("Api_" + _this.debugName + " handleRemoteCall: found selfMethod data.method=\"" + data.method + "\"");
                func = _this.definition.selfMethods[data.method];
            }
            else if (data.callback) {
                if (_this.config.debug)
                    console.log("Api_" + _this.debugName + " handleRemoteCall: it has a callback call request data.callback=\"" + data.callback + "\"");
                if (!_this.callbacks[data.callback]) {
                    console.error("callback '" + data.method + "' not found");
                    return;
                }
                if (_this.config.debug)
                    console.log("Api_" + _this.debugName + " handleRemoteCall: found callback=\"" + data.callback + "\"");
                func = _this.callbacks[data.callback];
            }
            else {
                console.error('not method & not callback');
                return;
            }
            if (_this.config.debug)
                console.log("Api_" + _this.debugName + " handleRemoteCall: processing data.args");
            var args = data.args.map(function (arg, argI) {
                if (arg.callback) {
                    if (_this.config.debug)
                        console.log("Api_" + _this.debugName + " handleRemoteCall: callback at " + argI + " arg index, returning proxy");
                    return function () {
                        var callbackArgs = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            callbackArgs[_i] = arguments[_i];
                        }
                        if (_this.config.debug)
                            console.log("Api_" + _this.debugName + " handleRemoteCall: proxy call for " + argI + " arg index, callbackArgs=\"" + JSON.stringify(callbackArgs) + "\", callback=\"" + arg.callback + "\"");
                        return _this.call({
                            callback: arg.callback,
                            args: callbackArgs,
                        });
                    };
                }
                return arg.value;
            });
            if (_this.config.debug)
                console.log("Api_" + _this.debugName + " handleRemoteCall: invoking func");
            return func.apply(void 0, args);
        };
        this.call = function (params) {
            if (_this.config.debug)
                console.log("Api_" + _this.debugName + " call: params=\"" + JSON.stringify(params) + "\"");
            var apiProtocol = {
                method: params.method,
                callback: params.callback,
                args: params.args.map(function (arg, argI) {
                    if (typeof arg === 'function') {
                        var callbackUUID = "" + _this.nextUUID();
                        _this.callbacks[callbackUUID] = arg;
                        if (_this.config.debug)
                            console.log("Api_" + _this.debugName + " call: found func arg at " + argI + " index, bound a callback as callbackUUID=\"" + callbackUUID + "\"");
                        return { callback: callbackUUID };
                    }
                    return { value: arg };
                }),
            };
            if (_this.config.debug)
                console.log("Api_" + _this.debugName + " call: sending request to transport");
            return _this.transport.request(apiProtocol);
        };
        this.callMethod = function (method) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return _this.call({ method: method, args: args });
        };
        this.callbacks = {};
        this.nextUUID = config.uuidGeneratorFactory();
        this.definition = definition;
        this.transport = transport;
        this.config = config;
        transport.setRequestHandler(this.handleRemoteCall);
    }
    return Api;
}());
exports.Api = Api;
