import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler, PodJSON } from './transport';
import * as tsargs from 'tsargs';
import { UUIDGenerator } from './utils';
import { ArgsN } from 'tsargs';

export type DefaultMethodMap = { [methodName: string]: (...args: any[]) => any };
type _AsyncApiDefintion<MethodMap extends DefaultMethodMap> = {
    [f in keyof MethodMap]: (...args: ArgsN<MethodMap[f]>) =>
        // if return type is void, return void
        ReturnType<MethodMap[f]> extends (void|undefined) ? void
            // otherwise wrap it to promise
            : ReturnType<MethodMap[f]> extends Promise<any> ? ReturnType<MethodMap[f]> : Promise<ReturnType<MethodMap[f]>>
}

export type ApiDefinition<
    RemoteMethodMap extends DefaultMethodMap,
    SelfMethodMap extends DefaultMethodMap,
> = {
    // version: string,
    // minVersion?: string[],
    // ignoreRemoteCall?: boolean|'disconnect'|'ban ip',
    selfMethods?: _AsyncApiDefintion<SelfMethodMap>,
};

export type ApiProtocolArg = {
    value?: PodJSON,
    callback?: string,
};

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
        definition: ApiDefinition<RemoteMethodMap, SelfMethodMap>,
        transport: ITransport,
        config: Config = DefaultConfig,
        public debugName = '',
    ) {
        this.nextUUID = config.uuidGeneratorFactory();
        this.definition = definition;
        this.transport = transport;
        this.config = config;

        transport.setRequestHandler(this.handleRemoteCall);
    }

    private handleRemoteCall: ITransportRequestHandler = (v) => {
        if (this.config.debug) {
            console.log(`Api_${this.debugName} handleRemoteCall: "${JSON.stringify(v)}"`);
        }
        const data = v as ApiProtocol;
        let func: Function;

        if (!data) throw new Error('Api: handleRemoteCall failed, undefined data');
        // TODO: validate ApiProtocol
        
        if (data.method) {
            if (!this.definition.selfMethods || !this.definition.selfMethods[data.method]) {
                console.error(`method '${data.method}' not found`);
                return;
            }
            if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: found selfMethod data.method="${data.method}"`);
            func = this.definition.selfMethods[data.method];
        } else if (data.callback) {
            if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: it has a callback call request data.callback="${data.callback}"`);
            if (!this.callbacks[data.callback]) {
                console.error(`callback '${data.method}' not found`);
                return;
            }
            if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: found callback="${data.callback}"`);
            func = this.callbacks[data.callback];
        } else {
            console.error('not method & not callback');
            return;
        }

        if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: processing data.args`);
        const args = data.args.map((arg, argI) => {
            if (arg.callback) {
                if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: callback at ${argI} arg index, returning proxy`);
                return (...callbackArgs: any[]) => {
                    if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: proxy call for ${argI} arg index, callbackArgs="${JSON.stringify(callbackArgs)}", callback="${arg.callback}"`);
                    return this._call({
                        callback: arg.callback,
                        args: callbackArgs,
                    });
                };
            }
            return arg.value;
        });

        if (this.config.debug) console.log(`Api_${this.debugName} handleRemoteCall: invoking func`);
        return func(...args);
    }

    _call = async (params: {
        method?: string,
        callback?: string,
        args: any[]
    }) => {
        if (this.config.debug) console.log(`Api_${this.debugName} call: params="${JSON.stringify(params)}"`);
        
        const apiProtocol: ApiProtocol = {
            method: params.method,
            callback: params.callback,
            args: params.args.map((arg, argI) => {
                if (typeof arg === 'function') {
                    const callbackUUID = `${this.nextUUID()}`;
                    this.callbacks[callbackUUID] = arg;
                    if (this.config.debug) console.log(`Api_${this.debugName} call: found func arg at ${argI} index, bound a callback as callbackUUID="${callbackUUID}"`);
                    return { callback: callbackUUID };
                }
                return { value: arg };
            }),
        };

        if (this.config.debug) console.log(`Api_${this.debugName} call: sending request to transport`);
        return this.transport.request<ApiProtocol>(apiProtocol);
    }

    callMethod = <Method extends keyof RemoteMethodMap>(
        method: Method,
        ...args: tsargs.ArgsN<RemoteMethodMap[Method]>
    ): ReturnType<_AsyncApiDefintion<RemoteMethodMap>[Method]> => this._call({ method: method as any, args }) as any;

    // TODO: call without callback mechanism, for speedup
    // callNoCallback;

    readonly definition: ApiDefinition<RemoteMethodMap, SelfMethodMap>;
    readonly transport: ITransport;
    readonly config: Config;

    private readonly callbacks: { [uuid: string]: Function } = {};

    nextUUID: UUIDGenerator;
}