"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.ApiProtocolArgTypeFlag = void 0;
const config_1 = require("./config");
const utils_1 = require("./utils/utils");
const callbacks_1 = require("./middlewares/callbacks");
var ApiProtocolArgTypeFlag;
(function (ApiProtocolArgTypeFlag) {
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["none"] = 0] = "none";
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["value"] = 1] = "value";
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["callback"] = 2] = "callback";
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["proxy"] = 4] = "proxy";
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["buffer"] = 5] = "buffer";
    // [0..16] RESERVED BITS
    /**
     * to detect extensions, `extension` bit must be set
     * ps `1 << 16`
     */
    ApiProtocolArgTypeFlag[ApiProtocolArgTypeFlag["extension"] = 65536] = "extension";
    // [17..32] CUSTOM USER BITS
})(ApiProtocolArgTypeFlag = exports.ApiProtocolArgTypeFlag || (exports.ApiProtocolArgTypeFlag = {}));
class Api {
    constructor(methods, transport, opts = {}) {
        this.handleRemoteCall = (v) => __awaiter(this, void 0, void 0, function* () {
            const rid = this.requestCounter();
            if (this.config.debug) {
                console.log(`Api_${this.debugName} handleRemoteCall: "${JSON.stringify(v)}" rid=${rid}`);
            }
            const data = v;
            let func;
            if (!data)
                throw new Error('Api: handleRemoteCall failed, undefined data');
            // TODO: validate ApiProtocol
            this._hook_preHandleRemoteCall(data, rid);
            const pickedFunc = this._hook_handleRemoteCallPickMethod(data, rid);
            if (pickedFunc) {
                func = pickedFunc;
            }
            else {
                if (data.method) {
                    if (!this.methods || !this.methods[data.method]) {
                        console.error(`method '${data.method}' not found`);
                        return {
                            data: undefined,
                            exception: `method '${data.method}' not found`,
                        };
                    }
                    if (this.config.debug)
                        console.log(`Api_${this.debugName} handleRemoteCall: found selfMethod data.method="${data.method}"`);
                    func = this.methods[data.method];
                }
                else {
                    console.error('no method field, checkout middlewares, protocol=' + JSON.stringify(data));
                    return {
                        data: undefined,
                        exception: 'no method field, checkout middlewares',
                    };
                }
            }
            if (this.config.debug)
                console.log(`Api_${this.debugName} handleRemoteCall: processing data.args`);
            const args = data.args.map((arg, argI) => {
                const unpacked = this._hook_unpackArg(arg, argI, rid);
                if (unpacked)
                    return unpacked;
                if (arg.type === ApiProtocolArgTypeFlag.value) {
                    return arg.value;
                }
                return undefined;
            });
            if (this.config.debug)
                console.log(`Api_${this.debugName} handleRemoteCall: invoking func`);
            try {
                const returnValue = yield func(...args);
                this._hook_postHandleRemoteCall(rid);
                const packedResult = this._hook_packReturnValue(returnValue, rid);
                return {
                    return: packedResult || {
                        type: ApiProtocolArgTypeFlag.value,
                        value: returnValue,
                    }
                };
            }
            catch (err) {
                return {
                    exception: `${err}`
                };
            }
        });
        this._send = (params) => __awaiter(this, void 0, void 0, function* () {
            const rid = this.requestCounter();
            if (this.config.debug)
                console.log(`Api_${this.debugName} call: params="${JSON.stringify(params)}" rid=${rid}`);
            this._hook_call(params, rid);
            const apiProtocol = {
                method: params.method,
                callback: params.callback,
                args: params.args.map((arg, argI) => {
                    const packed = this._hook_packArg(arg, argI, rid);
                    if (packed)
                        return packed;
                    return {
                        type: ApiProtocolArgTypeFlag.value,
                        value: arg,
                    };
                }),
            };
            if (this.config.debug)
                console.log(`Api_${this.debugName} call: sending request to transport`);
            const result = yield this.transport.request(apiProtocol);
            this._hook_postCall(params, rid);
            if ('exception' in result) {
                throw result.exception;
            }
            else {
                const unpackedResult = this._hook_unpackReturnValue(result.return, rid);
                if (unpackedResult)
                    return unpackedResult;
                if (result.return.type === ApiProtocolArgTypeFlag.value) {
                    return result.return.value;
                }
                else {
                    console.warn('unknown data return type, checkout middlewares');
                    return undefined;
                }
            }
        });
        /** deprecated, use `call` instead */
        this.callMethod = (method, ...args) => this._send({ method: method, args });
        this.call = (method, ...args) => this._send({ method: method, args });
        this.requestCounter = utils_1.simpleCountGenerator();
        this.hooks = MIDDLEWARE_HOOKS.reduce((sum, hookName) => (Object.assign(sum, { [hookName]: [] })), {});
        this._hook_call = (params, requestId) => {
            if (this.hooks.call.length === 0)
                return;
            const originalParams = Object.assign(Object.assign({}, params), { args: [
                    ...params.args,
                ] });
            for (const hook of this.hooks.call) {
                hook(params, originalParams, requestId);
            }
        };
        this._hook_postCall = (params, requestId) => {
            if (this.hooks.postCall.length === 0)
                return;
            for (const hook of this.hooks.postCall)
                hook(params, requestId);
        };
        this._hook_preHandleRemoteCall = (data, requestId) => {
            if (this.hooks.preHandleRemoteCall.length === 0)
                return;
            for (const hook of this.hooks.preHandleRemoteCall)
                hook(data, requestId);
        };
        this._hook_handleRemoteCallPickMethod = (data, requestId) => {
            if (this.hooks.handleRemoteCallPickMethod.length === 0)
                return;
            let prevPicked;
            for (const hook of this.hooks.handleRemoteCallPickMethod) {
                prevPicked = hook(prevPicked, data, requestId);
            }
            return prevPicked;
        };
        this._hook_postHandleRemoteCall = (requestId) => {
            if (this.hooks.postHandleRemoteCall.length === 0)
                return;
            for (const hook of this.hooks.postHandleRemoteCall)
                hook(requestId);
        };
        this._hook_packArg = (originalArg, argIndex, requestId) => {
            if (this.hooks.packArg.length === 0)
                return;
            let packedArg = undefined;
            for (const hook of this.hooks.packArg) {
                packedArg = hook(packedArg, originalArg, argIndex, requestId);
            }
            return packedArg;
        };
        this._hook_unpackArg = (originalArg, argIndex, requestId) => {
            if (this.hooks.unpackArg.length === 0)
                return;
            let unpackedArg = undefined;
            for (const hook of this.hooks.unpackArg) {
                unpackedArg = hook(unpackedArg, originalArg, argIndex, requestId);
            }
            return unpackedArg;
        };
        this._hook_packReturnValue = (originalReturnValue, requestId) => {
            if (this.hooks.packReturnValue.length === 0)
                return originalReturnValue;
            let packedReturn = undefined;
            for (const hook of this.hooks.packReturnValue) {
                packedReturn = hook(packedReturn, originalReturnValue, requestId);
            }
            return packedReturn;
        };
        this._hook_unpackReturnValue = (originalReturnValue, requestId) => {
            if (this.hooks.unpackReturnValue.length === 0)
                return originalReturnValue;
            let unpackedReturn = undefined;
            for (const hook of this.hooks.unpackReturnValue) {
                unpackedReturn = hook(unpackedReturn, originalReturnValue, requestId);
            }
            return unpackedReturn;
        };
        this.addMiddleware = (middleware) => __awaiter(this, void 0, void 0, function* () {
            if (middleware.install) {
                middleware.install.call(middleware, this, middleware);
            }
            for (const hookName of MIDDLEWARE_HOOKS) {
                if (middleware[hookName]) {
                    this.hooks[hookName].push(middleware[hookName].bind(middleware));
                }
            }
        });
        const { config = config_1.DefaultConfig, debugName = '', middlewares = [
            callbacks_1.callbacksMiddleware().middleware,
        ], } = opts;
        this.nextUUID = config.uuidGeneratorFactory();
        this.methods = methods;
        this.transport = transport;
        this.config = config;
        this.debugName = debugName;
        transport.setRequestHandler(this.handleRemoteCall);
        for (const m of middlewares) {
            this.addMiddleware(m);
        }
    }
}
exports.Api = Api;
const MIDDLEWARE_HOOKS = [
    'call',
    'postCall',
    'preHandleRemoteCall',
    'handleRemoteCallPickMethod',
    'postHandleRemoteCall',
    'packArg',
    'unpackArg',
    'packReturnValue',
    'unpackReturnValue'
];
