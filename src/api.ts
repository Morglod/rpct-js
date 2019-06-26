import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler, PodJSON } from './transport';
import * as tsargs from 'tsargs';

export type DefaultMethodMap = { [methodName: string]: (...args: any[]) => any };

export type ApiDefinition<
    RemoteMethodMap extends DefaultMethodMap,
    SelfMethodMap extends DefaultMethodMap,
> = {
    // version: string,
    // minVersion?: string[],
    // ignoreRemoteCall?: boolean|'disconnect'|'ban ip',
    selfMethods?: SelfMethodMap,
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
    ) {
        this.definition = definition;
        this.transport = transport;
        this.config = config;

        transport.setRequestHandler(this.handleRemoteCall);
    }

    private handleRemoteCall: ITransportRequestHandler = async (v) => {
        const data = v as ApiProtocol;
        let func: Function;

        if (!data) throw new Error('Api: handleRemoteCall failed, undefined data');
        // TODO: validate ApiProtocol
        
        if (data.method) {
            if (!this.definition.selfMethods || !this.definition.selfMethods[data.method]) {
                console.error(`method '${data.method}' not found`);
                return;
            }
            func = this.definition.selfMethods[data.method];
        } else if (data.callback) {
            if (!this.callbacks[data.callback]) {
                console.error(`callback '${data.method}' not found`);
                return;
            }
            func = this.callbacks[data.callback];
        } else {
            console.error('not method & not callback');
            return;
        }

        const args = data.args.map(arg => {
            if (arg.callback) {
                return (...callbackArgs: any[]) => {
                    return this.call({
                        callback: arg.callback,
                        args: callbackArgs,
                    });
                };
            }
            return arg.value;
        });

        if (this.config.debug) console.log('calling func');
        return func(...args);
    }

    call = async (params: {
        method?: string,
        callback?: string,
        args: any[]
    }) => {
        const apiProtocol: ApiProtocol = {
            method: params.method,
            callback: params.callback,
            args: params.args.map(arg => {
                if (typeof arg === 'function') {
                    const callbackUUID = `${++this.uuid}`;
                    this.callbacks[callbackUUID] = arg;
                    return { callback: callbackUUID };
                }
                return { value: arg };
            }),
        };

        return this.transport.request<ApiProtocol>(apiProtocol);
    }

    callMethod = async <Method extends keyof RemoteMethodMap>(
        method: Method,
        ...args: tsargs.ArgsN<RemoteMethodMap[Method]>
    ) => this.call({ method: method as any, args });

    readonly definition: ApiDefinition<RemoteMethodMap, SelfMethodMap>;
    readonly transport: ITransport;
    readonly config: Config;

    private readonly callbacks: { [uuid: string]: Function } = {};
    private uuid: number = 0;
}