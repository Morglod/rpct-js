import { ApiMiddleware, Api, ApiProtocolArgTypeFlag } from "../api";

export const callbacksMiddleware = () => {
    const callBoundCallbacks: {
        [requestId: number]: string[],
    } = {};

    /** temp storage for remote callbacks */
    const callbacks: {
        [uuid: string]: Function
    } = {};

    let api: Api<any, any>;

    const middleware: ApiMiddleware = {
        install(api_) {
            api = api_;
        },
    
        postCall(params, rid) {
            if (callBoundCallbacks[rid]) {
                for (const cbUUID of callBoundCallbacks[rid]) {
                    delete callbacks[cbUUID];
                }
                delete callBoundCallbacks[rid];
            }
        },
    
        packArg(_, origArg, argI, rid) {
            if (typeof origArg === 'function') {
                const callbackUUID = `${api.nextUUID()}`;
    
                if (!callBoundCallbacks[rid]) callBoundCallbacks[rid] = [];
                callBoundCallbacks[rid].push(callbackUUID);
    
                callbacks[callbackUUID] = origArg;
                if (api.config.debug) console.log(`Api_${api.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
                
                return {
                    type: ApiProtocolArgTypeFlag.callback,
                    callback: callbackUUID,
                };
            }
            return undefined;
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