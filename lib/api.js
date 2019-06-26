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
    function Api(definition, transport, config) {
        var _this = this;
        if (config === void 0) { config = config_1.DefaultConfig; }
        this.handleRemoteCall = function (v) { return __awaiter(_this, void 0, void 0, function () {
            var data, func, args;
            var _this = this;
            return __generator(this, function (_a) {
                data = v;
                if (!data)
                    throw new Error('Api: handleRemoteCall failed, undefined data');
                // TODO: validate ApiProtocol
                if (data.method) {
                    if (!this.definition.selfMethods || !this.definition.selfMethods[data.method]) {
                        console.error("method '" + data.method + "' not found");
                        return [2 /*return*/];
                    }
                    func = this.definition.selfMethods[data.method];
                }
                else if (data.callback) {
                    if (!this.callbacks[data.callback]) {
                        console.error("callback '" + data.method + "' not found");
                        return [2 /*return*/];
                    }
                    func = this.callbacks[data.callback];
                }
                else {
                    console.error('not method & not callback');
                    return [2 /*return*/];
                }
                args = data.args.map(function (arg) {
                    if (arg.callback) {
                        return function () {
                            var callbackArgs = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                callbackArgs[_i] = arguments[_i];
                            }
                            return _this.call({
                                callback: arg.callback,
                                args: callbackArgs,
                            });
                        };
                    }
                    return arg.value;
                });
                if (this.config.debug)
                    console.log('calling func');
                return [2 /*return*/, func.apply(void 0, args)];
            });
        }); };
        this.call = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var apiProtocol;
            var _this = this;
            return __generator(this, function (_a) {
                apiProtocol = {
                    method: params.method,
                    callback: params.callback,
                    args: params.args.map(function (arg) {
                        if (typeof arg === 'function') {
                            var callbackUUID = "" + ++_this.uuid;
                            _this.callbacks[callbackUUID] = arg;
                            return { callback: callbackUUID };
                        }
                        return { value: arg };
                    }),
                };
                return [2 /*return*/, this.transport.request(apiProtocol)];
            });
        }); };
        this.callMethod = function (method) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, this.call({ method: method, args: args })];
            }); });
        };
        this.callbacks = {};
        this.uuid = 0;
        this.definition = definition;
        this.transport = transport;
        this.config = config;
        transport.setRequestHandler(this.handleRemoteCall);
    }
    return Api;
}());
exports.Api = Api;
