import { Api, DefaultMethodMap } from './api';
import { PromisifyFuncReturnType } from './types';
export declare type ProxyMapRemoteApi<RemoteMethodMap extends DefaultMethodMap> = {
    [methodName in keyof RemoteMethodMap]: PromisifyFuncReturnType<RemoteMethodMap[methodName]>;
};
export declare function proxyMapRemote<RemoteMethodMap extends DefaultMethodMap>(api: Api<RemoteMethodMap, any>): ProxyMapRemoteApi<RemoteMethodMap>;
