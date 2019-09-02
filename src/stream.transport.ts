import { Config, DefaultConfig } from './config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol } from './transport';
import { TicketList } from './ticket-list';
import { IStreamReadable, IStreamWritable, StreamReadableLike, asReadableStream, asWritableStream, StreamWritableLike } from './stream.types';

export class StreamTransport implements ITransport {
    constructor(
        rstream: StreamReadableLike<ITransportProtocol>,
        wstream: StreamWritableLike<ITransportProtocol>,
        config: Config = DefaultConfig,
        public debugName: string = ''
    ) {
        this.rstream = asReadableStream(rstream);
        this.wstream = asWritableStream(wstream);

        this.setConfig(config);

        this.rstream.on('data', async (msg) => {
            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} onData: "${JSON.stringify(msg)}"`);
            }

            if (typeof msg !== 'object') throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);

            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: found pending, answering pending ticket uuid="${msg.uuid}"`);
                this.pending.answer(msg.uuid, msg, 'no uuid check');
            } else {
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: no pending ticket with this uuid="${msg.uuid}", calling requestHandler`);
                const resp = await this.requestHandler(msg.data)
                if (this.config.debug) console.log(`StreamIOTransport_${debugName}: requestHandler for uuid="${msg.uuid}", answered data: "${JSON.stringify(resp)}"`);
                this.wstream.write({
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

        if (this.config.debug) console.log(`StreamIOTransport_${this.debugName}: making request with uuid="${uuid}", data="${JSON.stringify(data)}", new pending ticket`);

        const { answer } = this.pending.ask(req.uuid);
        this.wstream.write(req);
        return answer.then(x => x.data);
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

    readonly rstream: IStreamReadable<ITransportProtocol>;
    readonly wstream: IStreamWritable<ITransportProtocol>;

    private requestHandler!: ITransportRequestHandler;
    config: Readonly<Config> = DefaultConfig;
    pending = new TicketList<ITransportProtocol>();
}