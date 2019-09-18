import { Config } from './config';
import { ITransport } from './transport';
import { ArgsN } from 'tsargs';
import { UUIDGenerator } from './utils';
import { PodJSON, PromisifyFuncReturnType } from './types';
export declare type DefaultMethodMap = {
    [methodName: string]: (...args: any[]) => any;
};
export declare type ApiDefinition<MethodMap extends DefaultMethodMap> = {
    [f in keyof MethodMap]: PromisifyFuncReturnType<MethodMap[f]>;
};
export declare enum ApiProtocolArgTypeFlag {
    none = 0,
    value = 1,
    callback = 2,
    proxy = 4,
    /**
     * to detect extensions, `extension` bit must be set
     * ps `1 << 16`
     */
    extension = 65536
}
declare type ApiProtocolArg_None = {
    type: ApiProtocolArgTypeFlag.none;
};
declare type ApiProtocolArg_Value = {
    type: ApiProtocolArgTypeFlag.value;
    value: PodJSON;
};
declare type ApiProtocolArg_Callback = {
    type: ApiProtocolArgTypeFlag.callback;
    callback: string;
};
declare type ApiProtocolArg_Proxy = {
    type: ApiProtocolArgTypeFlag.proxy;
    objId: string | number;
};
export declare type ApiProtocolArg = ApiProtocolArg_None | ApiProtocolArg_Value | ApiProtocolArg_Callback | ApiProtocolArg_Proxy;
export declare type ApiProtocol = {
    method?: string;
    callback?: string;
    args: ApiProtocolArg[];
};
export declare class Api<RemoteMethodMap extends DefaultMethodMap, SelfMethodMap extends DefaultMethodMap> {
    constructor(methods: SelfMethodMap, transport: ITransport, opts?: {
        config?: Config;
        debugName?: string;
        middlewares?: ApiMiddleware[];
    });
    debugName: string;
    private handleRemoteCall;
    private _call;
    /** deprecated, use `call` instead */
    readonly callMethod: <Method extends keyof RemoteMethodMap>(method: Method, ...args: ArgsN<RemoteMethodMap[Method]>) => ReturnType<ApiDefinition<RemoteMethodMap>[Method]>;
    readonly call: <Method extends keyof RemoteMethodMap>(method: Method, ...args: ArgsN<RemoteMethodMap[Method]>) => ReturnType<ApiDefinition<RemoteMethodMap>[Method]>;
    readonly methods: SelfMethodMap;
    readonly transport: ITransport;
    readonly config: Config;
    nextUUID: UUIDGenerator;
    requestCounter: () => number;
    readonly hooks: {
        readonly [hookName in MIDDLEWARE_HOOK_NAME]: Required<ApiMiddleware>[hookName][];
    };
    private _hook_call;
    private _hook_postCall;
    private _hook_preHandleRemoteCall;
    private _hook_handleRemoteCallPickMethod;
    private _hook_postHandleRemoteCall;
    private _hook_packArg;
    private _hook_unpackArg;
    private _hook_packReturnValue;
    private _hook_unpackReturnValue;
    readonly addMiddleware: (middleware: ApiMiddleware<Api<any, any>, any, any>) => Promise<void>;
}
declare const MIDDLEWARE_HOOKS: readonly ["call", "postCall", "preHandleRemoteCall", "handleRemoteCallPickMethod", "postHandleRemoteCall", "packArg", "unpackArg", "packReturnValue", "unpackReturnValue"];
declare type MIDDLEWARE_HOOK_NAME = typeof MIDDLEWARE_HOOKS[number];
export declare type ApiMiddleware<ApiT extends Api<RemoteMethodMap, SelfMethodMap> = Api<any, any>, RemoteMethodMap extends DefaultMethodMap = any, SelfMethodMap extends DefaultMethodMap = any> = {
    /** runs on api.addMiddleware */
    install?(api: ApiT, middleware: ApiMiddleware<ApiT, RemoteMethodMap, SelfMethodMap>): void;
    call?(params: {
        method?: string;
        callback?: string;
        args: any[];
    }, originalParams: {
        method?: string;
        callback?: string;
        args: any[];
    }, requestId: number): void;
    postCall?(params: {
        method?: string;
        callback?: string;
        args: any[];
    }, requestId: number): void;
    /** preprocess data */
    preHandleRemoteCall?(data: ApiProtocol, requestId: number): void;
    handleRemoteCallPickMethod?(prevPicked: Function | undefined, data: ApiProtocol, requestId: number): Function | undefined;
    postHandleRemoteCall?(requestId: number): void;
    /** pack arg on call */
    packArg?(packedArg: ApiProtocolArg | undefined, originalArg: any, argIndex: number, requestId: number): ApiProtocolArg | undefined;
    /** unpack arg on handle remote call */
    unpackArg?(unpackedArg: any | undefined, originalArg: ApiProtocolArg, argIndex: number, requestId: number): any;
    /** pack returning value after call handling */
    packReturnValue?(packedReturnValue: PodJSON | undefined, originalReturnValue: any, requestId: number): PodJSON | undefined;
    /** unpack returned value after call */
    unpackReturnValue?(unpackedReturnValue: any | undefined, originalReturnValue: PodJSON, requestId: number): any;
};
export {};
