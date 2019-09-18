import { Config } from './config';
import { ITransport, ITransportRequestHandler, ITransportData, ITransportProtocol, ITransportResponse } from './transport';
import { TicketList } from './ticket-list';
import { IStreamReadable, IStreamWritable, StreamReadableLike, StreamWritableLike } from './stream.types';
export declare class StreamTransport implements ITransport {
    debugName: string;
    constructor(rstream: StreamReadableLike<ITransportProtocol>, wstream: StreamWritableLike<ITransportProtocol>, config?: Config, debugName?: string);
    request(data: ITransportData): Promise<ITransportResponse>;
    setRequestHandler(handler: ITransportRequestHandler): void;
    getRequestHandler(): ITransportRequestHandler;
    setConfig(config: Config): void;
    readonly rstream: IStreamReadable<ITransportProtocol>;
    readonly wstream: IStreamWritable<ITransportProtocol>;
    private requestHandler;
    config: Readonly<Config>;
    pending: TicketList<ITransportProtocol>;
}
