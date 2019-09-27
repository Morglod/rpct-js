import { Config, DefaultConfig } from '../config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol, ITransportResponse, transportProtocolToResponse, isTransportProtocolReturnable, isTransportProtocolApi } from '../transports/itransport';
import { TicketList } from '../utils/ticket-list';
import { IStreamDuplex } from '../streams/istream';
import { ApiProtocolArgTypeFlag } from '../api';

export class DuplexStreamTransport implements ITransport {
    constructor(
        stream: IStreamDuplex<ITransportProtocol, ITransportProtocol>,
        config: Config = DefaultConfig,
        public debugName: string = ''
    ) {
        this.setConfig(config);
        
        this.stream = stream;

        stream.on('data', async (msg) => {
            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} received message: "${JSON.stringify(msg)}"`);
            }

            if (typeof msg !== 'object') throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);

            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: found pending`, msg.uuid);
                if (isTransportProtocolReturnable(msg)) {
                    this.pending.answer(msg.uuid, msg, 'no uuid check');
                } else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should be returnable`);
                }
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                if (isTransportProtocolApi(msg)) {
                    const resp = await this.requestHandler(msg.api);
                    this.stream.write(Object.assign(resp, {
                        uuid: msg.uuid
                    }));
                } else {
                    throw new Error(`StreamIOTransport_${debugName}: chunkProtocol without .api`);
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

        if (this.config.debug) console.log(`StreamIOTransport_${this.debugName}: making request`, data);

        const { answer } = this.pending.ask(req.uuid);
        this.stream.write(req);
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
    readonly stream: IStreamDuplex<ITransportProtocol, ITransportProtocol>;
    config: Readonly<Config> = DefaultConfig;

    pending = new TicketList<ITransportResponse>();
}