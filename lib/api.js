"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
class Api {
    constructor(methods, transport, config = config_1.DefaultConfig, debugName = '') {
        this.debugName = debugName;
        this.handleRemoteCall = (v) => {
            if (this.config.debug) {
                console.log(`Api_${this.debugName} handleRemoteCall: "${JSON.stringify(v)}"`);
            }
            const data = v;
            let func;
            if (!data)
                throw new Error('Api: handleRemoteCall failed, undefined data');
            // TODO: validate ApiProtocol
            if (data.method) {
                if (!this.methods || !this.methods[data.method]) {
                    console.error(`method '${data.method}' not found`);
                    return;
                }
                if (this.config.debug)
                    console.log(`Api_${this.debugName} handleRemoteCall: found selfMethod data.method="${data.method}"`);
                func = this.methods[data.method];
            }
            else if (data.callback) {
                if (this.config.debug)
                    console.log(`Api_${this.debugName} handleRemoteCall: it has a callback call request data.callback="${data.callback}"`);
                if (!this.callbacks[data.callback]) {
                    console.error(`callback '${data.method}' not found`);
                    return;
                }
                if (this.config.debug)
                    console.log(`Api_${this.debugName} handleRemoteCall: found callback="${data.callback}"`);
                func = this.callbacks[data.callback];
                delete this.callbacks[data.callback];
            }
            else {
                console.error('not method & not callback');
                return;
            }
            if (this.config.debug)
                console.log(`Api_${this.debugName} handleRemoteCall: processing data.args`);
            const args = data.args.map((arg, argI) => {
                if (arg.callback) {
                    if (this.config.debug)
                        console.log(`Api_${this.debugName} handleRemoteCall: callback at ${argI} arg index, returning proxy`);
                    return (...callbackArgs) => {
                        if (this.config.debug)
                            console.log(`Api_${this.debugName} handleRemoteCall: proxy call for ${argI} arg index, callbackArgs="${JSON.stringify(callbackArgs)}", callback="${arg.callback}"`);
                        return this._call({
                            callback: arg.callback,
                            args: callbackArgs,
                        });
                    };
                }
                return arg.value;
            });
            if (this.config.debug)
                console.log(`Api_${this.debugName} handleRemoteCall: invoking func`);
            return func(...args);
        };
        this._call = (params) => __awaiter(this, void 0, void 0, function* () {
            if (this.config.debug)
                console.log(`Api_${this.debugName} call: params="${JSON.stringify(params)}"`);
            const apiProtocol = {
                method: params.method,
                callback: params.callback,
                args: params.args.map((arg, argI) => {
                    if (typeof arg === 'function') {
                        const callbackUUID = `${this.nextUUID()}`;
                        this.callbacks[callbackUUID] = arg;
                        if (this.config.debug)
                            console.log(`Api_${this.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
                        return { callback: callbackUUID };
                    }
                    return { value: arg };
                }),
            };
            if (this.config.debug)
                console.log(`Api_${this.debugName} call: sending request to transport`);
            return this.transport.request(apiProtocol);
        });
        this.callMethod = (method, ...args) => this._call({ method: method, args });
        /** temp storage for remote callbacks */
        this.callbacks = {};
        this.nextUUID = config.uuidGeneratorFactory();
        this.methods = methods;
        this.transport = transport;
        this.config = config;
        transport.setRequestHandler(this.handleRemoteCall);
    }
}
exports.Api = Api;
