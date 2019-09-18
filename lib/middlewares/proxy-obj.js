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
const api_1 = require("../api");
exports.proxyObjMiddleware = () => {
    let api = undefined;
    const boundObjects = {};
    const $proxy_callField = (objId, path, args) => {
        if (api.config.debug)
            console.log(`Api_${api.debugName} proxy_callField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const func = getByPath(obj, path);
            return func(...args);
        }
        catch (_a) {
            return undefined;
        }
    };
    const $proxy_getField = (objId, path) => {
        if (api.config.debug)
            console.log(`Api_${api.debugName} proxy_getField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            return getByPath(obj, path);
        }
        catch (_a) {
            return undefined;
        }
    };
    const $proxy_setField = (objId, path, value) => {
        if (api.config.debug)
            console.log(`Api_${api.debugName} proxy_setField ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            setByPath(obj, path, value);
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    const $proxy_canProxify = (objId, path) => {
        if (api.config.debug)
            console.log(`Api_${api.debugName} proxy_canProxify ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const x = getByPath(obj, path);
            if (typeof x === 'object')
                return true;
            return false;
        }
        catch (_a) {
            return false;
        }
    };
    const $proxy_canCall = (objId, path) => {
        if (api.config.debug)
            console.log(`Api_${api.debugName} proxy_canCall ${objId} ${path}`);
        const obj = boundObjects[objId];
        try {
            const x = getByPath(obj, path);
            if (typeof x === 'function')
                return true;
            return false;
        }
        catch (_a) {
            return false;
        }
    };
    const middleware = {
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
            if (typeof origArg === 'object' && 'PROXY_OBJ_MARKER' in origArg && origArg['PROXY_OBJ_MARKER'] === exports.PROXY_OBJ_MARKER) {
                if (api.config.debug)
                    console.log(`Api_${api.debugName} packArg proxified argI=${argI}`);
                return {
                    type: api_1.ApiProtocolArgTypeFlag.proxy,
                    objId: origArg.objId,
                };
            }
            return undefined;
        },
        unpackArg(_, originalArg) {
            if (originalArg.type === api_1.ApiProtocolArgTypeFlag.proxy) {
                if (api.config.debug)
                    console.log(`Api_${api.debugName} unpackArg connecting proxy`);
                const { objId } = originalArg;
                return connectToRemoteProxyObj(objId, '', x);
            }
        }
    };
    const x = {
        middleware,
        uuidGenerator: undefined,
        api,
        boundObjects,
        serveProxyObj: (obj) => serveProxyObj(obj, x),
    };
    return x;
};
function deepProxyAsyncHooks(subpath = '', hooks, _target = {}) {
    const proxy = new Proxy(_target, {
        get(target, prop) {
            if (typeof prop === 'symbol')
                return undefined;
            const pth = subpath + '.' + prop;
            return deepProxyAsyncHooks(pth, hooks, () => { });
        },
        apply(target, thisArg, args) {
            return __awaiter(this, void 0, void 0, function* () {
                const pth = subpath;
                if (yield hooks.canCall(pth)) {
                    return hooks.callField(pth, args);
                }
                else {
                    if (args && Array.isArray(args) && args.length) {
                        return hooks.setField(pth, args[1]);
                    }
                    else {
                        return hooks.getField(pth);
                    }
                }
            });
        }
    });
    return proxy;
}
exports.PROXY_OBJ_MARKER = Symbol('proxy obj');
function serveProxyObj(obj, middleware) {
    const objId = middleware.uuidGenerator();
    middleware.boundObjects[objId] = obj;
    return {
        objId,
        PROXY_OBJ_MARKER: exports.PROXY_OBJ_MARKER
    };
}
function connectToRemoteProxyObj(objId, subpath, middleware) {
    return deepProxyAsyncHooks(subpath, {
        callField(pth, args) {
            if (middleware.api.config.debug)
                console.log(`Api_${middleware.api.debugName} remote proxy call field ${pth}`);
            return middleware.api.call('$proxy_callField', objId, pth, args);
        },
        getField(pth) {
            if (middleware.api.config.debug)
                console.log(`Api_${middleware.api.debugName} remote proxy get field ${pth}`);
            return middleware.api.call('$proxy_getField', objId, pth);
        },
        setField(pth, val) {
            if (middleware.api.config.debug)
                console.log(`Api_${middleware.api.debugName} remote proxy set field ${pth}`);
            return middleware.api.call('$proxy_setField', objId, pth, val);
        },
        canProxify(pth) {
            if (middleware.api.config.debug)
                console.log(`Api_${middleware.api.debugName} remote proxy can proxify ${pth}`);
            return middleware.api.call('$proxy_canProxify', objId, pth);
        },
        canCall(pth) {
            if (middleware.api.config.debug)
                console.log(`Api_${middleware.api.debugName} remote proxy can call ${pth}`);
            return middleware.api.call('$proxy_canCall', objId, pth);
        }
    });
}
function setByPath(obj, path, val) {
    const pathparts = path.split('.');
    for (let i = 0; i < pathparts.length - 1; ++i) {
        if (pathparts[i] === '')
            continue;
        obj = obj[pathparts[i]];
    }
    obj[pathparts[pathparts.length - 1]] = val;
}
function getByPath(obj, path) {
    const pathparts = path.split('.');
    for (let i = 0; i < pathparts.length; ++i) {
        if (pathparts[i] === '')
            continue;
        obj = obj[pathparts[i]];
    }
    return obj;
}
