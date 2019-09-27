import { Config, DefaultConfig } from '../config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol, ITransportResponse, isTransportProtocolReturnable } from '../transports/itransport';
import { TicketList } from '../utils/ticket-list';
import { IStreamDuplex } from '../streams/istream';
import { ApiProtocolArgTypeFlag, ApiProtocol } from '../api';

export class DuplexJsonStreamTransport implements ITransport {
    constructor(stream: IStreamDuplex, config: Config = DefaultConfig, public debugName: string = '') {
        this.setConfig(config);
        
        this.stream = stream;

        stream.on('data', async (chunk) => {
            let jsonStr;

            if (chunk instanceof Uint8Array) {
                jsonStr = chunk.toString();
            } else if (typeof chunk === 'object') {
                jsonStr = chunk;
            } else {
                jsonStr = `${chunk}`;
            }

            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} received message: "${jsonStr}"`);
            }

            let chunkProtocol = chunk as any as ITransportProtocol;

            try {
                if (typeof jsonStr === 'string') chunkProtocol = JSON.parse(jsonStr) as ITransportProtocol;
            } catch (err) {
                throw err;
            }

            if (typeof chunkProtocol !== 'object') throw new Error(`StreamIOTransport_${debugName} wrong message type; should be object`);
            const k = Object.keys(chunkProtocol);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid')) throw new Error(`StreamIOTransport_${debugName} wrong message type; should have uuid`);

            if (this.pending.hasUUID(chunkProtocol.uuid)) {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: found pending`, chunkProtocol.uuid);
                if (isTransportProtocolReturnable(chunkProtocol)) {
                    this.pending.answer(chunkProtocol.uuid, chunkProtocol, 'no uuid check');
                } else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should be returnable`);
                }
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                if ('api' in chunkProtocol) {
                    const resp = await this.requestHandler(chunkProtocol.api);
                    this.stream.write(JSON.stringify(Object.assign(resp, {
                        uuid: chunkProtocol.uuid,
                    })));
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
        this.stream.write(JSON.stringify(req));
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
        this.pending.nextUUID = this.config.uuidGeneratorFactory();
    }

    private requestHandler!: ITransportRequestHandler;
    readonly stream: IStreamDuplex;
    config: Readonly<Config> = DefaultConfig;

    pending = new TicketList<ITransportResponse>();
}