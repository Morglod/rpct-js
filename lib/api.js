"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        this.call = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var apiProtocol;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.config.debug)
                    console.log("Api_" + this.debugName + " call: params=\"" + JSON.stringify(params) + "\"");
                apiProtocol = {
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
                if (this.config.debug)
                    console.log("Api_" + this.debugName + " call: sending request to transport");
                return [2 /*return*/, this.transport.request(apiProtocol)];
            });
        }); };
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
