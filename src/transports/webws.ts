import { Config, DefaultConfig } from '../config';
import { ITransport, ITransportRequestHandler, ITransportProtocol, ITransportData, ITransportResponse, isTransportProtocolReturnable, isTransportProtocolApi } from './itransport';
import { TicketList } from '../utils/ticket-list';

export type WebWSTransportProtocolHandler = (response: ITransportProtocol) => void;

export type WebWSSocket = {
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    addEventListener(type: 'message', listener: (event: { data: any }) => any): void
};

export class WebWSTransport implements ITransport {
    constructor(
        socket: WebWSSocket,
        config: Config = DefaultConfig,
        public debugName: string = ''
    ) {
        this.setConfig(config);

        this.socket = socket;
        socket.addEventListener('message', async (ev: { data: any }) => {
            const msg = JSON.parse(ev.data);

            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} onData: "${JSON.stringify(msg)}"`);
            }

            if (typeof msg !== 'object') throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);

            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: found pending, answering pending ticket uuid="${msg.uuid}"`);
                if (isTransportProtocolReturnable(msg)) {
                    this.pending.answer(msg.uuid, msg, 'no uuid check');
                } else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should be returnable`);
                }
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: no pending ticket with this uuid="${msg.uuid}", calling requestHandler`);
                
                if (isTransportProtocolApi(msg)) {
                    const resp = await this.requestHandler(msg.api);
                    if (this.config.debug) console.log(`StreamIOTransport_${debugName}: requestHandler for uuid="${msg.uuid}", answered data: "${JSON.stringify(resp)}"`);
                    this.socket.send(JSON.stringify(Object.assign(resp, {
                        uuid: msg.uuid,
                    })));
                } else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should has api`);
                }
            }
        });
    }

    request(data: ITransportData): Promise<ITransportResponse> {
        const uuid = this.pending.nextUUID();
        
        const req: ITransportProtocol = {
            uuid,
            api: data,
        };

        const { answer } = this.pending.ask(req.uuid);
        this.socket.send(JSON.stringify(req));

        return answer.catch(err => ({
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
        this.pending.nextUUID = this.config.uuidGeneratorFactory();
    }

    private requestHandler!: ITransportRequestHandler;
    readonly socket: WebWSSocket;
    config: Readonly<Config> = DefaultConfig;

    pending = new TicketList<ITransportResponse>();
}