import 'socket.io-client';

import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler, ITransportProtocol, ITransportData, ITransportResponse } from './transport';
import { TicketList } from './ticket-list';

export type SocketIOTransportProtocolHandler = (response: ITransportProtocol) => void;

export type SocketIOSocket = {
    on(eventName: string, handler: (data: any) => void): void;
    emit(eventName: string, data: any): void;
};

export class SocketIOTransport implements ITransport {
    constructor(socket: SocketIOSocket, config: Config = DefaultConfig) {
        this.setConfig(config);

        this.socket = socket;
        socket.on(this.eventName, async (response: ITransportProtocol) => {
            if (this.config.debug) console.log('SocketIOTransport: onData', JSON.stringify(response, null, 2));

            if (this.pending.hasUUID(response.uuid)) {
                if (this.config.debug) console.log('SocketIOTransport: found pending', response.uuid);
                this.pending.answer(response.uuid, response, 'no uuid check');
            } else {
                if (this.config.debug) console.log('SocketIOTransport: forEach requestHandler');
                const resp = await this.requestHandler(response.data);
                this.socket.emit(this.eventName, Object.assign(resp, {
                    uuid: response.uuid,
                }));
            }
        });
    }

    request(data: ITransportData): Promise<ITransportResponse> {
        const uuid = this.pending.nextUUID();
        
        const req: ITransportProtocol = {
            uuid,
            data,
        };

        const { answer } = this.pending.ask(req.uuid);
        this.socket.emit(this.eventName, req);
        return answer.catch(err => ({
            data: undefined,
            exception: `${err}`,
        }));
    }

    setRequestHandler(handler: ITransportRequestHandler): void {
        this.requestHandler = handler;
    }

    getRequestHandler() {
        return this.requestHandler;
    }

    setConfig(config: Config) {
        this.config = config;
        this.eventName = 'rpct-' + config.version;
        this.pending.nextUUID = this.config.uuidGeneratorFactory();
    }

    private requestHandler!: ITransportRequestHandler;
    readonly socket: SocketIOSocket;
    config: Readonly<Config> = DefaultConfig;
    eventName = '';

    pending = new TicketList<ITransportProtocol>();
}