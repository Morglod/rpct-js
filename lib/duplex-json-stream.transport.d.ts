import { Config } from './config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol } from './transport';
import { TicketList } from './ticket-list';
import { IStreamDuplex } from './streams';
export declare class DuplexJsonStreamTransport implements ITransport {
    debugName: string;
    constructor(stream: IStreamDuplex, config?: Config, debugName?: string);
    request(data: ITransportData): Promise<ITransportData>;
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
    setConfig(config: Config): void;
    private requestHandler;
    readonly stream: IStreamDuplex;
    config: Readonly<Config>;
    pending: TicketList<ITransportProtocol>;
}
