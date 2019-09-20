import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler } from './transports/itransport';
import { ArgsN } from 'tsargs';
import { UUIDGenerator, simpleCountGenerator } from './utils/utils';
import { PodJSON, PromisifyFuncReturnType } from './utils/types';
import { callbacksMiddleware } from './middlewares/callbacks';

export type DefaultMethodMap = { [methodName: string]: (...args: any[]) => any };
export type ApiDefinition<MethodMap extends DefaultMethodMap> = {
    [f in keyof MethodMap]: PromisifyFuncReturnType<MethodMap[f]>
}

export enum ApiProtocolArgTypeFlag {
    none = 0,
    value = 1,
    callback = 2,
    proxy = 4,

    // [0..16] RESERVED BITS

    /**
     * to detect extensions, `extension` bit must be set  
     * ps `1 << 16`
     */
    extension = 65536,

    // [17..32] CUSTOM USER BITS
}

type ApiProtocolArg_None = {
    type: ApiProtocolArgTypeFlag.none
};

type ApiProtocolArg_Value = {
    type: ApiProtocolArgTypeFlag.value,
    value: PodJSON,
};

type ApiProtocolArg_Callback = {
    type: ApiProtocolArgTypeFlag.callback,
    callback: string,
};

type ApiProtocolArg_Proxy = {
    type: ApiProtocolArgTypeFlag.proxy,
    objId: string|number,
};

export type ApiProtocolArg =
    ApiProtocolArg_None |
    ApiProtocolArg_Value |
    ApiProtocolArg_Callback |
    ApiProtocolArg_Proxy
;

export type ApiProtocol = {
    method?: string,
    callback?: string,
    args: ApiProtocolArg[]
};

export class Api<
    RemoteMethodMap extends DefaultMethodMap,
    SelfMethodMap extends DefaultMethodMap,
> {
    constructor(
        methods: SelfMethodMap,
        transport: ITransport,
        opts: {
            config?: Config,
            debugName?: string,
            middlewares?: ApiMiddleware[]
        } = {}
    ) {
        const {
            config = DefaultConfig,
            debugName = '',
            middlewares = [
                callbacksMiddleware().middleware,
            ],
        } = opts;
        
        this.nextUUID = config.uuidGeneratorFactory();
        this.methods = methods;
        this.transport = transport;
        this.config = config;
        this.debugName = debugName;

        transport.setRequestHandler(this.handleRemoteCall);

        for (const m of middlewares) {
            this.addMiddleware(m);
        }
    }

    debugName: string;

    private handleRemoteCall: ITransportRequestHandler = async (v) => {
        const rid = this.requestCounter();

        if (this.config.debug) {
            console.log(`Api_${this.debugName} handleRemoteCall: "${JSON.stringify(v)}" rid=${rid}`);
        }
        const data = v as ApiProtocol;
        let func: Function;

        if (!data) throw new Error('Api: handleRemoteCall failed, undefined data');
        // TODO: validate ApiProtocol

        this._hook_preHandleRemoteCall(data, rid);

        const pickedFunc = this._hook_handleRemoteCallPickMethod(data, rid);

        if (pickedFunc) {
            func = pickedFunc;
        }
        else {
            if (data.method) {
                if (!this.methods || !this.methods[data.method]) {
                    console.error(`method '${data.method}' not found`);
                    return {
                        data: undefined,
                        exception: `method '${data.method}' not found`,
                    };
                }
                if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: found selfMethod data.method="${data.method}"`);
                func = this.methods[data.method];
            } else {
                console.error('not method & not callback');
                return {
                    data: undefined,
                    exception: 'not method & not callback',
                };
            }
        }

        if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: processing data.args`);
        const args = data.args.map((arg, argI) => {
            const unpacked = this._hook_unpackArg(arg, argI, rid);
            if (unpacked) return unpacked;

            if (arg.type === ApiProtocolArgTypeFlag.callback) {
                if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: callback at ${argI} arg index, returning proxy`);
                return (...callbackArgs: any[]) => {
                    if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: proxy call for ${argI} arg index, callbackArgs="${JSON.stringify(callbackArgs)}", callback="${arg.callback}"`);
                    return this._call({
                        callback: arg.callback,
                        args: callbackArgs,
                    });
                };
            }

            if (arg.type === ApiProtocolArgTypeFlag.value) {
                return arg.value;
            }

            return undefined;
        });

        if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: invoking func`);

        try {
            const returnValue = await func(...args);
    
            this._hook_postHandleRemoteCall(rid);
    
            const packedResult = this._hook_packReturnValue(returnValue, rid);
    
            return {
                data: packedResult || returnValue
            };
        } catch (err) {
            return {
                data: undefined,
                exception: `${err}`
            };
        }
    }

    private _call = async (params: {
        method?: string,
        callback?: string,
        args: any[]
    }) => {
        const rid = this.requestCounter();

        if (this.config.debug) console.log(`Api_${this.debugName} call: params="${JSON.stringify(params)}" rid=${rid}`);

        this._hook_call(params, rid);

        const apiProtocol: ApiProtocol = {
            method: params.method,
            callback: params.callback,
            args: params.args.map((arg, argI) => {
                const packed = this._hook_packArg(arg, argI, rid);
                if (packed) return packed;

                return {
                    type: ApiProtocolArgTypeFlag.value,
                    value: arg,
                };
            }),
        };

        if (this.config.debug) console.log(`Api_${this.debugName} call: sending request to transport`);
        const result = await this.transport.request<ApiProtocol>(apiProtocol);

        this._hook_postCall(params, rid);

        if (result.exception) {
            throw result.exception;
        } else {
            const unpackedResult = this._hook_unpackReturnValue(result.data, rid);
            if (unpackedResult) return unpackedResult;
            return result.data;
        }
    }

    /** deprecated, use `call` instead */
    readonly callMethod = <Method extends keyof RemoteMethodMap>(
        method: Method,
        ...args: ArgsN<RemoteMethodMap[Method]>
    ): ReturnType<ApiDefinition<RemoteMethodMap>[Method]> => this._call({ method: method as any, args }) as any;

    readonly call = <Method extends keyof RemoteMethodMap>(
        method: Method,
        ...args: ArgsN<RemoteMethodMap[Method]>
    ): ReturnType<ApiDefinition<RemoteMethodMap>[Method]> => this._call({ method: method as any, args }) as any;

    // TODO: call without callback mechanism, for speedup
    // callNoCallback;

    readonly methods: SelfMethodMap;
    readonly transport: ITransport;
    readonly config: Config;

    nextUUID: UUIDGenerator;

    requestCounter: () => number = simpleCountGenerator();

    readonly hooks: {
        readonly [hookName in MIDDLEWARE_HOOK_NAME]: Required<ApiMiddleware>[hookName][]
    } = MIDDLEWARE_HOOKS.reduce((sum, hookName) => (
        Object.assign(sum, { [hookName]: [] as Required<ApiMiddleware>[typeof hookName][] })
    ), {} as {
        readonly [hookName in MIDDLEWARE_HOOK_NAME]: Required<ApiMiddleware>[hookName][]
    });

    private _hook_call = (
        params: {
            method?: string,
            callback?: string,
            args: any[]
        },
        requestId: number,
    ) => {
        if (this.hooks.call.length === 0) return;

        const originalParams = {
            ...params,
            args: [
                ...params.args,
            ],
        };

        for (const hook of this.hooks.call) {
            hook(params, originalParams, requestId);
        }
    };

    private _hook_postCall = (
        params: {
            method?: string,
            callback?: string,
            args: any[]
        },
        requestId: number,
    ) => {
        if (this.hooks.postCall.length === 0) return;
        for (const hook of this.hooks.postCall) hook(params, requestId);
    };

    private _hook_preHandleRemoteCall = (data: ApiProtocol, requestId: number) => {
        if (this.hooks.preHandleRemoteCall.length === 0) return;
        for (const hook of this.hooks.preHandleRemoteCall) hook(data, requestId);
    };

    private _hook_handleRemoteCallPickMethod = (data: ApiProtocol, requestId: number) => {
        if (this.hooks.handleRemoteCallPickMethod.length === 0) return;

        let prevPicked;
        for (const hook of this.hooks.handleRemoteCallPickMethod) {
            prevPicked = hook(prevPicked, data, requestId);
        }

        return prevPicked;
    };

    private _hook_postHandleRemoteCall = (requestId: number) => {
        if (this.hooks.postHandleRemoteCall.length === 0) return;
        for (const hook of this.hooks.postHandleRemoteCall) hook(requestId);
    };

    private _hook_packArg = (originalArg: any, argIndex: number, requestId: number): ApiProtocolArg|undefined => {
        if (this.hooks.packArg.length === 0) return;

        let packedArg = undefined;
        for (const hook of this.hooks.packArg) {
            packedArg = hook(packedArg, originalArg, argIndex, requestId);
        }

        return packedArg;
    };

    private _hook_unpackArg = (originalArg: ApiProtocolArg, argIndex: number, requestId: number): any|undefined => {
        if (this.hooks.unpackArg.length === 0) return;

        let unpackedArg = undefined;
        for (const hook of this.hooks.unpackArg) {
            unpackedArg = hook(unpackedArg, originalArg, argIndex, requestId);
        }

        return unpackedArg;
    };

    private _hook_packReturnValue = (originalReturnValue: any, requestId: number): PodJSON|undefined => {
        if (this.hooks.packReturnValue.length === 0) return originalReturnValue;

        let packedReturn = undefined;
        for (const hook of this.hooks.packReturnValue) {
            packedReturn = hook(packedReturn, originalReturnValue, requestId);
        }

        return packedReturn;
    };

    private _hook_unpackReturnValue = (originalReturnValue: PodJSON, requestId: number): any|undefined => {
        if (this.hooks.unpackReturnValue.length === 0) return originalReturnValue;

        let unpackedReturn = undefined;
        for (const hook of this.hooks.unpackReturnValue) {
            unpackedReturn = hook(unpackedReturn, originalReturnValue, requestId);
        }

        return unpackedReturn;
    };

    readonly addMiddleware = async (middleware: ApiMiddleware) => {
        if (middleware.install) {
            middleware.install.call(middleware, this, middleware);
        }

        for (const hookName of MIDDLEWARE_HOOKS) {
            if (middleware[hookName]) {
                this.hooks[hookName].push(middleware[hookName]!.bind(middleware) as any);
            }
        }
    };
}

const MIDDLEWARE_HOOKS = [
    'call',
    'postCall',
    'preHandleRemoteCall',
    'handleRemoteCallPickMethod',
    'postHandleRemoteCall',
    'packArg',
    'unpackArg',
    'packReturnValue',
    'unpackReturnValue'
] as const;

type MIDDLEWARE_HOOK_NAME = typeof MIDDLEWARE_HOOKS[number];

export type ApiMiddleware<
    ApiT extends Api<RemoteMethodMap, SelfMethodMap> = Api<any, any>,
    RemoteMethodMap extends DefaultMethodMap = any,
    SelfMethodMap extends DefaultMethodMap = any,
> = {
    /** runs on api.addMiddleware */
    install?(
        api: ApiT,
        middleware: ApiMiddleware<ApiT, RemoteMethodMap, SelfMethodMap>
    ): void;

    call?(
        params: {
            method?: string,
            callback?: string,
            args: any[]
        },
        originalParams: {
            method?: string,
            callback?: string,
            args: any[]
        },
        requestId: number,
    ): void;

    postCall?(
        params: {
            method?: string,
            callback?: string,
            args: any[]
        },
        requestId: number
    ): void;

    /** preprocess data */
    preHandleRemoteCall?(data: ApiProtocol, requestId: number): void;
    handleRemoteCallPickMethod?(prevPicked: Function|undefined, data: ApiProtocol, requestId: number): Function|undefined;
    postHandleRemoteCall?(requestId: number): void;

    /** pack arg on call */
    packArg?(packedArg: ApiProtocolArg|undefined, originalArg: any, argIndex: number, requestId: number): ApiProtocolArg|undefined;

    /** unpack arg on handle remote call */
    unpackArg?(unpackedArg: any|undefined, originalArg: ApiProtocolArg, argIndex: number, requestId: number): any;

    /** pack returning value after call handling */
    packReturnValue?(packedReturnValue: PodJSON|undefined, originalReturnValue: any, requestId: number): PodJSON|undefined;

    /** unpack returned value after call */
    unpackReturnValue?(unpackedReturnValue: any|undefined, originalReturnValue: PodJSON, requestId: number): any;
};