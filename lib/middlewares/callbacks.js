"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
exports.callbacksMiddleware = () => ({
    callBoundCallbacks: {},
    callbacks: {},
    api: undefined,
    install(api) {
        this.api = api;
        this.callbacks = {};
    },
    call(params, origParams, rid) {
        // this.callBoundCallbacks[rid] = [];
    },
    postCall(params, rid) {
        if (this.callBoundCallbacks[rid]) {
            for (const cbUUID of this.callBoundCallbacks[rid]) {
                delete this.callbacks[cbUUID];
            }
            delete this.callBoundCallbacks[rid];
        }
    },
    packArg(_, origArg, argI, rid) {
        if (typeof origArg === 'function') {
            const callbackUUID = `${this.api.nextUUID()}`;
            if (!this.callBoundCallbacks[rid])
                this.callBoundCallbacks[rid] = [];
            this.callBoundCallbacks[rid].push(callbackUUID);
            this.callbacks[callbackUUID] = origArg;
            if (this.api.config.debug)
                console.log(`Api_${this.api.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
            return {
                type: api_1.ApiProtocolArgTypeFlag.callback,
                callback: callbackUUID,
            };
        }
        return undefined;
    },
    handleRemoteCallPickMethod(prevPicked, data, rid) {
        if (data.callback) {
            if (this.api.config.debug)
                console.log(`Api_${this.api.debugName} handleRemoteCall: it has a callback call request data.callback="${data.callback}"`);
            if (!this.callbacks[data.callback]) {
                console.error(`callback '${data.method}' not found`);
                return;
            }
            if (this.api.config.debug)
                console.log(`Api_${this.api.debugName} handleRemoteCall: found callback="${data.callback}"`);
            return this.callbacks[data.callback];
            // delete this.callbacks[data.callback];
        }
    }
});
