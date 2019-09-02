import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol } from './transport';
import { TicketList } from './ticket-list';
import { IStreamDuplex } from './stream.types';

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
                this.pending.answer(msg.uuid, msg, 'no uuid check');
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                const resp = await this.requestHandler(msg.data);
                this.stream.write({
                    uuid: msg.uuid,
                    data: resp,
                });
            }
        });
    }

    request(data: ITransportData): Promise<ITransportData> {
        const uuid = this.pending.nextUUID();
        
        const req: ITransportProtocol = {
            uuid,
            data,
        };

        if (this.config.debug) console.log(`StreamIOTransport_${this.debugName}: making request`, data);

        const { answer } = this.pending.ask(req.uuid);
        this.stream.write(req);
        return answer;
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

    pending = new TicketList<ITransportProtocol>();
}