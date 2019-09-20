import { Api, DefaultMethodMap } from './api';
import { PromisifyFuncReturnType } from './types';

export type ProxyMapRemoteApi<
    RemoteMethodMap extends DefaultMethodMap
> = {
    [methodName in keyof RemoteMethodMap]: PromisifyFuncReturnType<RemoteMethodMap[methodName]>
};

export function proxyMapRemote<
    RemoteMethodMap extends DefaultMethodMap,
>(api: Api<RemoteMethodMap, any>): ProxyMapRemoteApi<RemoteMethodMap> {
    return new Proxy({}, {
        get(target, p, receiver: any) {
            return (...args: any) => api.call(p as any, ...args);
        }
    }) as any;
}