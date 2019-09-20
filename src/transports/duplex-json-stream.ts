import { Config, DefaultConfig } from '../config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol, ITransportResponse } from '../transports/itransport';
import { TicketList } from '../utils/ticket-list';
import { IStreamDuplex } from '../streams/istream';

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

            let msg: ITransportProtocol = chunk as any;

            try {
                if (typeof jsonStr === 'string') msg = JSON.parse(jsonStr) as ITransportProtocol;
            } catch (err) {
                throw err;
            }

            if (typeof msg !== 'object') throw new Error(`StreamIOTransport_${debugName} wrong message type; should be object`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid')) throw new Error(`StreamIOTransport_${debugName} wrong message type; should have uuid`);

            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: found pending`, msg.uuid);
                this.pending.answer(msg.uuid, msg, 'no uuid check');
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                const resp = await this.requestHandler(msg.data);
                this.stream.write(JSON.stringify(Object.assign(resp, {
                    uuid: msg.uuid,
                })));
            }
        });
    }

    request(data: ITransportData): Promise<ITransportResponse> {
        const uuid = this.pending.nextUUID();
        
        const req: ITransportProtocol = {
            uuid,
            data,
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

    pending = new TicketList<ITransportProtocol>();
}