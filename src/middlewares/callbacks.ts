import { ApiMiddleware, Api, ApiProtocolArgTypeFlag, ApiProtocolArg } from "../api";
import { setObjectOptions, getObjectOptions } from "../utils/object-options";

export const CALLBACK_OPTIONS_SYMBOL = Symbol('callback options');

export type CallbackOptions = {
    /** bind remote callback forever, use `middleware.freeCallback` to dispose it */
    noAutoFree?: boolean,
};

export const defaultCallbackOptions = <T extends (...args: any) => any>(func: T): CallbackOptions => ({
    noAutoFree: false,
});

export const appendCallbackOptions = <T extends (...args: any) => any>(func: T, opts: CallbackOptions): T => {
    return setObjectOptions(func, CALLBACK_OPTIONS_SYMBOL, {
        ...getObjectOptions(func, CALLBACK_OPTIONS_SYMBOL, defaultCallbackOptions),
        ...opts,
    });
};

/** bind remote callback forever, use `middleware.freeCallback` to dispose it */
export const bindCallback = <T extends (...args: any) => any>(func: T): T => {
    return appendCallbackOptions(func, {
        noAutoFree: true
    });
};

export const callbacksMiddleware = () => {
    const callBoundCallbacks: {
        [requestId: number]: string[],
    } = {};

    /** temp storage for remote callbacks */
    const callbacks: {
        [uuid: string]: Function
    } = {};

    let api: Api<any, any>;

    const autoFreeCallback = (map: typeof callbacks, uuid: string) => {
        const opts = getObjectOptions<CallbackOptions|undefined, Function>(map[uuid], CALLBACK_OPTIONS_SYMBOL, undefined);
        if (opts && opts.noAutoFree) {
            return;
        }
        delete map[uuid];
    };

    const pack = (arg: any, argI: number, rid: number) => {
        if (typeof arg === 'function') {
            const callbackUUID = `${api.nextUUID()}`;

            if (!callBoundCallbacks[rid]) callBoundCallbacks[rid] = [];
            callBoundCallbacks[rid].push(callbackUUID);

            callbacks[callbackUUID] = arg;
            if (api.config.debug) console.log(`Api_${api.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
            
            return {
                type: ApiProtocolArgTypeFlag.callback,
                callback: callbackUUID,
            } as const;
        }
        return undefined;
    };

    const unpack = (arg: ApiProtocolArg, argI: number, rid: number) => {
        if (arg.type === ApiProtocolArgTypeFlag.callback) {
            if (api.config.debug) console.log(`Api_${api.debugName} handleRemoteCall: callback at ${argI} arg index, returning proxy`);
            return (...callbackArgs: any[]) => {
                if (api.config.debug) console.log(`Api_${api.debugName} handleRemoteCall: proxy call for ${argI} arg index, callbackArgs="${JSON.stringify(callbackArgs)}", callback="${arg.callback}"`);
                return api._send({
                    callback: arg.callback,
                    args: callbackArgs,
                });
            };
        }
    };

    const middleware: ApiMiddleware = {
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
    
        packArg(_, origArg, argI, rid) {
            return pack(origArg, argI, rid);
        },

        unpackArg(_, orginArg, argI, rid) {
            return unpack(orginArg, argI, rid);
        },

        packReturnValue(_, origReturnValue, rid) {
            return pack(origReturnValue, -1, rid);
        },

        unpackReturnValue(_, origReturnValue, rid) {
            return unpack(origReturnValue, -1, rid);
        },
    
        handleRemoteCallPickMethod(prevPicked, data, rid) {
            if (data.callback) {
                if (api.config.debug) console.log(`Api_${api.debugName} handleRemoteCall: it has a callback call request data.callback="${data.callback}"`);
                if (!callbacks[data.callback]) {
                    console.error(`callback '${data.method}' not found`);
                    return;
                }
                if (api.config.debug) console.log(`Api_${api.debugName} handleRemoteCall: found callback="${data.callback}"`);
                return callbacks[data.callback];
            }
        }
    };

    const freeCallback = (cb: Function) => {
        const foundkv = Object.entries(callbacks).find(([,v]) => v === cb);
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