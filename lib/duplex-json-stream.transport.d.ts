import { Config } from './config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol, ITransportResponse } from './transport';
import { TicketList } from './ticket-list';
import { IStreamDuplex } from './stream.types';
export declare class DuplexJsonStreamTransport implements ITransport {
    debugName: string;
    constructor(stream: IStreamDuplex, config?: Config, debugName?: string);
    request(data: ITransportData): Promise<ITransportResponse>;
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
    setConfig(config: Config): void;
    private requestHandler;
    readonly stream: IStreamDuplex;
    config: Readonly<Config>;
    pending: TicketList<ITransportProtocol>;
}
