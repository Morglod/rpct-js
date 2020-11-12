"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbacksMiddleware = exports.bindCallback = exports.appendCallbackOptions = exports.defaultCallbackOptions = exports.CALLBACK_OPTIONS_SYMBOL = void 0;
const api_1 = require("../api");
const object_options_1 = require("../utils/object-options");
exports.CALLBACK_OPTIONS_SYMBOL = Symbol('callback options');
exports.defaultCallbackOptions = (func) => ({
    noAutoFree: false,
});
exports.appendCallbackOptions = (func, opts) => {
    return object_options_1.setObjectOptions(func, exports.CALLBACK_OPTIONS_SYMBOL, Object.assign(Object.assign({}, object_options_1.getObjectOptions(func, exports.CALLBACK_OPTIONS_SYMBOL, exports.defaultCallbackOptions)), opts));
};
/** bind remote callback forever, use `middleware.freeCallback` to dispose it */
exports.bindCallback = (func) => {
    return exports.appendCallbackOptions(func, {
        noAutoFree: true
    });
};
exports.callbacksMiddleware = () => {
    const callBoundCallbacks = {};
    /** temp storage for remote callbacks */
    const callbacks = {};
    let api;
    const autoFreeCallback = (map, uuid) => {
        const opts = object_options_1.getObjectOptions(map[uuid], exports.CALLBACK_OPTIONS_SYMBOL, undefined);
        if (opts && opts.noAutoFree) {
            return;
        }
        delete map[uuid];
    };
    const pack = (arg, argI, rid) => {
        if (typeof arg === 'function') {
            const callbackUUID = `${api.nextUUID()}`;
            if (!callBoundCallbacks[rid])
                callBoundCallbacks[rid] = [];
            callBoundCallbacks[rid].push(callbackUUID);
            callbacks[callbackUUID] = arg;
            if (api.config.debug)
                console.log(`Api_${api.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
            return {
                type: api_1.ApiProtocolArgTypeFlag.callback,
                callback: callbackUUID,
            };
        }
        return undefined;
    };
    const unpack = (arg, argI, rid) => {
        if (arg.type === api_1.ApiProtocolArgTypeFlag.callback) {
            if (api.config.debug)
                console.log(`Api_${api.debugName} handleRemoteCall: callback at ${argI} arg index, returning proxy`);
            return (...callbackArgs) => {
                if (api.config.debug)
                    console.log(`Api_${api.debugName} handleRemoteCall: proxy call for ${argI} arg index, callbackArgs="${JSON.stringify(callbackArgs)}", callback="${arg.callback}"`);
                return api._send({
                    callback: arg.callback,
                    args: callbackArgs,
                });
            };
        }
    };
    const middleware = {
        install(api_) {
            api = api_;
        },
        postCall(params, rid) {
            if (callBoundCallbacks[rid]) {
                for (const cbUUID of callBoundCallbacks[rid]) {
                    autoFreeCallback(callbacks, cbUUID);
                }
                delete callBoundCallbacks[rid];
            }
        },
        packArg(packed, origArg, argI, rid) {
            const r = pack(origArg, argI, rid);
            return r === undefined ? packed : r;
        },
        unpackArg(unpacked, orginArg, argI, rid) {
            const r = unpack(orginArg, argI, rid);
            return r === undefined ? unpacked : r;
        },
        packReturnValue(packed, origReturnValue, rid) {
            const r = pack(origReturnValue, -1, rid);
            return r === undefined ? packed : r;
        },
        unpackReturnValue(unpacked, origReturnValue, rid) {
            const r = unpack(origReturnValue, -1, rid);
            return r === undefined ? unpacked : r;
        },
        handleRemoteCallPickMethod(prevPicked, data, rid) {
            if (data.callback) {
                if (api.config.debug)
                    console.log(`Api_${api.debugName} handleRemoteCall: it has a callback call request data.callback="${data.callback}"`);
                if (!callbacks[data.callback]) {
                    console.error(`callback '${data.method}' not found`);
                    return;
                }
                if (api.config.debug)
                    console.log(`Api_${api.debugName} handleRemoteCall: found callback="${data.callback}"`);
                return callbacks[data.callback];
            }
        }
    };
    const freeCallback = (cb) => {
        const foundkv = Object.entries(callbacks).find(([, v]) => v === cb);
        if (foundkv) {
            const [k] = foundkv;
            delete callbacks[k];
        }
    };
    return {
        middleware,
        freeCallback
    };
};
