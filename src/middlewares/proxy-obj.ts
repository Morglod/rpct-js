import { ApiMiddleware, Api, ApiProtocolArgTypeFlag } from "../api";
import { UUIDGenerator } from "../utils";
import { PlainUUID, PromisifyFuncReturnType } from "../types";

export type ProxyApiMethods = {
    $proxy_callField(objId: PlainUUID, path: string, args: any[]): any,
    $proxy_getField(objId: PlainUUID, path: string): any,
    $proxy_setField(objId: PlainUUID, path: string, value: any): boolean,
    $proxy_canProxify(objId: PlainUUID, path: string): boolean,
    $proxy_canCall(objId: PlainUUID, path: string): boolean,
};

export const proxyObjMiddleware = () => {
    let api: Api<ProxyApiMethods, ProxyApiMethods> = undefined!;
    const boundObjects: {
        [objectId: string]: any,
    } = {};

    const $proxy_callField = (objId: PlainUUID, path: string, args: any[]): any => {
        if (api.config.debug) console.log(`Api_${api.debugName} proxy_callField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const func = getByPath(obj, path);
            return func(...args);
        } catch {
            return undefined;
        }
    };
    const $proxy_getField = (objId: PlainUUID, path: string): any => {
        if (api.config.debug) console.log(`Api_${api.debugName} proxy_getField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            return getByPath(obj, path);
        } catch {
            return undefined;
        }
    };
    const $proxy_setField = (objId: PlainUUID, path: string, value: any): boolean => {
        if (api.config.debug) console.log(`Api_${api.debugName} proxy_setField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            setByPath(obj, path, value);
            return true;
        } catch {
            return false;
        }
    };
    const $proxy_canProxify = (objId: PlainUUID, path: string): boolean => {
        if (api.config.debug) console.log(`Api_${api.debugName} proxy_canProxify ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const x = getByPath(obj, path);
            if (typeof x === 'object') return true;
            return false;
        } catch {
            return false;
        }
    };
    const $proxy_canCall = (objId: PlainUUID, path: string): boolean => {
        if (api.config.debug) console.log(`Api_${api.debugName} proxy_canCall ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const x = getByPath(obj, path);
            if (typeof x === 'function') return true;
            return false;
        } catch {
            return false;
        }
    };

    const middleware: ApiMiddleware = {
        install(api_) {
            api = api_;
            x.api = api_;
            x.uuidGenerator = api_.config.uuidGeneratorFactory();
            Object.assign(api_.methods, {
                $proxy_callField: $proxy_callField.bind(this),
                $proxy_getField: $proxy_getField.bind(this),
                $proxy_setField: $proxy_setField.bind(this),
                $proxy_canProxify: $proxy_canProxify.bind(this),
                $proxy_canCall: $proxy_canCall.bind(this),
            });
        },
    
        packArg(_, origArg, argI, rid) {
            if (typeof origArg === 'object' && 'PROXY_OBJ_MARKER' in origArg && origArg['PROXY_OBJ_MARKER'] === PROXY_OBJ_MARKER) {
                if (api.config.debug) console.log(`Api_${api.debugName} packArg proxified argI=${argI}`);
                return {
                    type: ApiProtocolArgTypeFlag.proxy,
                    objId: origArg.objId,
                };
            }
            return undefined;
        },
    
        unpackArg(_, originalArg) {
            if (originalArg.type === ApiProtocolArgTypeFlag.proxy) {
                if (api.config.debug) console.log(`Api_${api.debugName} unpackArg connecting proxy`);
                const { objId } = originalArg;
                return connectToRemoteProxyObj(objId, '', x);
            }
        }
    };

    const x = {
        middleware,
        uuidGenerator: undefined! as UUIDGenerator,
        api,
        boundObjects,
        serveProxyObj: <T extends object>(obj: T): RemoteProxyObj<T> => serveProxyObj(obj, x),
    };

    return x;
};

function deepProxyAsyncHooks<T extends object>(
    subpath: string = '',
    hooks: {
        callField(path: string, args: any[]): Promise<any>,
        getField(path: string): Promise<any>,
        setField(path: string, value: any): Promise<boolean>,
        canProxify(path: string): Promise<boolean>,
        canCall(path: string): Promise<boolean>,
    },
    _target: any = {},
): T {
    const proxy = new Proxy<T>(_target, {
        get(target, prop: string) {
            if (typeof prop === 'symbol') return undefined;
            const pth = subpath + '.' + prop;
            return deepProxyAsyncHooks(pth, hooks, () => {});
        },
        async apply(target, thisArg, args) {
            const pth = subpath;
            if (await hooks.canCall(pth)) {
                return hooks.callField(pth, args);
            } else {
                if (args && Array.isArray(args) && args.length) {
                    return hooks.setField(pth, args[1]);
                } else {
                    return hooks.getField(pth);
                }
            }
        }
    });

    return proxy;
}

export const PROXY_OBJ_MARKER = Symbol('proxy obj');

function serveProxyObj<T extends object>(
    obj: T,
    middleware: ReturnType<typeof proxyObjMiddleware>,
): RemoteProxyObj<T> {
    const objId = middleware.uuidGenerator();
    middleware.boundObjects[objId] = obj;

    return {
        objId,
        PROXY_OBJ_MARKER
    } as RemoteProxyObj<T>;
}

type RemoteProxyObjField<FieldT> =
    FieldT extends void|never ? never :
    // field is function
    FieldT extends (...args: any[]) => any ? PromisifyFuncReturnType<FieldT> :
    // field is array
    FieldT extends any[] ? () => Promise<FieldT> :
    // field is object
    FieldT extends { [x: string]: any } ? ({
        [k in keyof FieldT]: RemoteProxyObjField<FieldT[k]>
    }) :
    // field is pod value
    (update?: FieldT) => Promise<FieldT>
;

export type RemoteProxyObj<T> = RemoteProxyObjField<T>;

function connectToRemoteProxyObj<T extends object>(
    objId: PlainUUID,
    subpath: string,
    middleware: ReturnType<typeof proxyObjMiddleware>,
): RemoteProxyObj<T> {
    return deepProxyAsyncHooks(subpath, {
        callField(pth, args) {
            if (middleware.api.config.debug) console.log(`Api_${middleware.api.debugName} remote proxy call field ${pth}`);
            return middleware.api.call('$proxy_callField', objId, pth, args);
        },
        getField(pth) {
            if (middleware.api.config.debug) console.log(`Api_${middleware.api.debugName} remote proxy get field ${pth}`);
            return middleware.api.call('$proxy_getField', objId, pth);
        },
        setField(pth, val) {
            if (middleware.api.config.debug) console.log(`Api_${middleware.api.debugName} remote proxy set field ${pth}`);
            return middleware.api.call('$proxy_setField', objId, pth, val);
        },
        canProxify(pth) {
            if (middleware.api.config.debug) console.log(`Api_${middleware.api.debugName} remote proxy can proxify ${pth}`);
            return middleware.api.call('$proxy_canProxify', objId, pth);
        },
        canCall(pth) {
            if (middleware.api.config.debug) console.log(`Api_${middleware.api.debugName} remote proxy can call ${pth}`);
            return middleware.api.call('$proxy_canCall', objId, pth);
        }
    });
}

function setByPath(obj: any, path: string, val: any) {
    const pathparts = path.split('.');
    for (let i = 0; i < pathparts.length - 1; ++i) {
        if (pathparts[i] === '') continue;
        obj = obj[pathparts[i]];
    }
    obj[pathparts[pathparts.length - 1]] = val;
}

function getByPath(obj: any, path: string) {
    const pathparts = path.split('.');
    for (let i = 0; i < pathparts.length; ++i) {
        if (pathparts[i] === '') continue;
        obj = obj[pathparts[i]];
    }
    return obj;
}
