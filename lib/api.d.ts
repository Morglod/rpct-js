import { Config } from './config';
import { ITransport, PodJSON } from './transport';
import * as tsargs from 'tsargs';
import { UUIDGenerator } from './utils';
export declare type DefaultMethodMap = {
    [methodName: string]: (...args: any[]) => any;
};
export declare type ApiDefinition<MethodMap extends DefaultMethodMap> = {
    [f in keyof MethodMap]: (...args: tsargs.ArgsN<MethodMap[f]>) => ReturnType<MethodMap[f]> extends (void | undefined) ? void : ReturnType<MethodMap[f]> extends Promise<any> ? ReturnType<MethodMap[f]> : Promise<ReturnType<MethodMap[f]>>;
};
export declare type ApiProtocolArg = {
    value?: PodJSON;
    callback?: string;
};
export declare type ApiProtocol = {
    method?: string;
    callback?: string;
    args: ApiProtocolArg[];
};
export declare class Api<RemoteMethodMap extends DefaultMethodMap, SelfMethodMap extends DefaultMethodMap> {
    debugName: string;
    constructor(methods: ApiDefinition<SelfMethodMap>, transport: ITransport, config?: Config, debugName?: string);
    private handleRemoteCall;
    _call: (params: {
        method?: string | undefined;
        callback?: string | undefined;
        args: any[];
    }) => Promise<string | number | boolean | (string | number | boolean | null | undefined)[] | {
        [x: string]: PodJSON;
        [x: number]: PodJSON;
    } | {
        [x: string]: PodJSON[];
        [x: number]: PodJSON[];
    } | {
        [x: string]: PodJSON;
        [x: number]: PodJSON;
    }[] | {
        [x: string]: PodJSON[];
        [x: number]: PodJSON[];
    }[]>;
    callMethod: <Method extends keyof RemoteMethodMap>(method: Method, ...args: tsargs.ArgsN<RemoteMethodMap[Method]>) => ReturnType<ApiDefinition<RemoteMethodMap>[Method]>;
    readonly methods: ApiDefinition<SelfMethodMap>;
    readonly transport: ITransport;
    readonly config: Config;
    /** temp storage for remote callbacks */
    private readonly callbacks;
    nextUUID: UUIDGenerator;
}
